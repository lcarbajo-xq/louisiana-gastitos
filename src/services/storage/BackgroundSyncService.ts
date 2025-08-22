import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState, AppStateStatus } from 'react-native'
import BackgroundJob from 'react-native-background-job'
import { useAuthStore } from '../store/authStore'
import { useBankingStore } from '../store/bankingStore'
import type { TransactionQueueItem } from '../types/banking'

interface BackgroundSyncConfig {
  enabled: boolean
  interval: number // en milisegundos
  maxRetries: number
  retryDelay: number // en milisegundos
}

export class BackgroundSyncService {
  private static instance: BackgroundSyncService
  private isRunning: boolean = false
  private syncInterval: ReturnType<typeof setInterval> | null = null
  private appStateSubscription: any = null
  private lastForegroundTime: Date = new Date()

  private config: BackgroundSyncConfig = {
    enabled: true,
    interval: 30 * 60 * 1000, // 30 minutos
    maxRetries: 3,
    retryDelay: 5 * 60 * 1000 // 5 minutos
  }

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService()
    }
    return BackgroundSyncService.instance
  }

  async initialize(): Promise<void> {
    try {
      // Cargar configuración guardada
      const savedConfig = await AsyncStorage.getItem('background_sync_config')
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) }
      }

      // Configurar listeners de estado de la app
      this.setupAppStateListener()

      // Iniciar servicio si está habilitado
      if (this.config.enabled) {
        await this.start()
      }
    } catch (error) {
      console.error('Failed to initialize background sync service:', error)
    }
  }

  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    )
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    const now = new Date()

    if (nextAppState === 'active') {
      // App volvió al foreground
      const timeInBackground = now.getTime() - this.lastForegroundTime.getTime()
      const thresholdMs = 10 * 60 * 1000 // 10 minutos

      // Si estuvo en background más de 10 minutos, sincronizar
      if (timeInBackground > thresholdMs) {
        this.triggerSync('foreground_activation')
      }

      this.lastForegroundTime = now
    } else if (nextAppState === 'background') {
      // App fue a background
      this.setupBackgroundSync()
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    try {
      this.isRunning = true

      // Procesar queue pendiente
      await this.processQueue()

      // Configurar sincronización periódica
      this.setupPeriodicSync()

      console.log('Background sync service started')
    } catch (error) {
      console.error('Failed to start background sync service:', error)
      this.isRunning = false
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    // Detener trabajos en background
    BackgroundJob.cancel({ jobKey: 'banking_sync' })

    console.log('Background sync service stopped')
  }

  private setupPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(async () => {
      if (this.isRunning && this.config.enabled) {
        await this.triggerSync('periodic')
      }
    }, this.config.interval)
  }

  private setupBackgroundSync(): void {
    if (!this.config.enabled) return

    // Configurar trabajo en background (iOS/Android)
    BackgroundJob.start({
      jobKey: 'banking_sync',
      period: Math.min(this.config.interval, 15 * 60 * 1000), // Máximo 15 minutos
      taskName: 'BankingSyncTask'
    })
  }

  private async triggerSync(
    source: 'periodic' | 'foreground_activation' | 'manual'
  ): Promise<void> {
    try {
      console.log(`Triggering sync from source: ${source}`)

      // Verificar autenticación
      const authStore = useAuthStore.getState()
      if (!authStore.isAuthenticated) {
        console.log('User not authenticated, skipping sync')
        return
      }

      // Verificar si hay conexión de red (simplificado)
      // En producción usarías @react-native-community/netinfo

      const bankingStore = useBankingStore.getState()

      // No sincronizar si ya está en proceso
      if (bankingStore.isSyncing) {
        console.log('Sync already in progress, skipping')
        return
      }

      // Verificar tiempo desde último sync
      const now = new Date()
      const lastSync = bankingStore.lastSyncDate
      if (lastSync) {
        const timeSinceSync = now.getTime() - lastSync.getTime()
        const minInterval = 5 * 60 * 1000 // Mínimo 5 minutos entre syncs

        if (timeSinceSync < minInterval && source === 'periodic') {
          console.log('Too soon since last sync, skipping')
          return
        }
      }

      // Ejecutar sincronización
      await bankingStore.syncAllAccounts()

      // Procesar queue después del sync
      await this.processQueue()

      // Actualizar timestamp de último background sync
      await AsyncStorage.setItem('last_background_sync', now.toISOString())
    } catch (error) {
      console.error('Background sync failed:', error)

      // Agregar a queue para retry
      this.addToRetryQueue({
        type: 'sync',
        data: {
          source,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date(),
        retryCount: 0,
        status: 'failed'
      })
    }
  }

  private async processQueue(): Promise<void> {
    try {
      const bankingStore = useBankingStore.getState()
      const queue = [...bankingStore.transactionQueue] // Copia para evitar modificaciones concurrentes

      for (const item of queue) {
        if (item.status !== 'pending' && item.status !== 'failed') continue

        try {
          await this.processQueueItem(item)

          // Marcar como completado - actualizar el item existente
          // Por simplicidad, asumimos que el store tiene un método para esto
          console.log(`Queue item ${item.id} completed successfully`)
        } catch (error) {
          console.error(`Failed to process queue item ${item.id}:`, error)

          // Incrementar contador de reintentos
          const newRetryCount = item.retryCount + 1

          if (newRetryCount >= this.config.maxRetries) {
            // Marcar como fallido permanentemente - log por ahora
            console.error(
              `Queue item ${item.id} failed permanently after ${newRetryCount} retries`
            )
          } else {
            // Programar retry
            setTimeout(() => {
              bankingStore.addToQueue({
                type: item.type,
                data: item.data
              })
            }, this.config.retryDelay * Math.pow(2, newRetryCount)) // Backoff exponencial
          }
        }
      }

      // Limpiar items completados antiguos
      await this.cleanupQueue()
    } catch (error) {
      console.error('Queue processing failed:', error)
    }
  }

  private async processQueueItem(item: TransactionQueueItem): Promise<void> {
    const bankingStore = useBankingStore.getState()

    switch (item.type) {
      case 'sync':
        await bankingStore.syncAllAccounts()
        break

      case 'reconcile':
        const { transactionId, expenseId } = item.data
        const transaction = bankingStore.transactions.find(
          (tx) => tx.id === transactionId
        )
        if (transaction) {
          await bankingStore.reconcileTransaction(transaction, expenseId)
        }
        break

      case 'ignore':
        bankingStore.markTransactionAsIgnored(item.data.transactionId)
        break

      case 'manual_match':
        // Implementar lógica de matching manual
        break

      default:
        throw new Error(`Unknown queue item type: ${item.type}`)
    }
  }

  private async cleanupQueue(): Promise<void> {
    const bankingStore = useBankingStore.getState()
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días

    // Filtrar items antiguos completados
    const itemsToKeep = bankingStore.transactionQueue.filter((item) => {
      // Mantener items pendientes o fallidos recientes
      if (item.status === 'pending' || item.status === 'processing') return true

      // Mantener items completados/fallidos de la última semana
      return item.timestamp > cutoffDate
    })

    // Log cleanup info
    const removedCount =
      bankingStore.transactionQueue.length - itemsToKeep.length
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old queue items`)
    }

    // TODO: Implementar método updateQueue en el store para actualizar
    // bankingStore.updateQueue(itemsToKeep)
  }

  private addToRetryQueue(item: Omit<TransactionQueueItem, 'id'>): void {
    const bankingStore = useBankingStore.getState()
    bankingStore.addToQueue({
      type: item.type,
      data: item.data
    })
  }

  // Métodos públicos para configuración

  async updateConfig(config: Partial<BackgroundSyncConfig>): Promise<void> {
    this.config = { ...this.config, ...config }

    await AsyncStorage.setItem(
      'background_sync_config',
      JSON.stringify(this.config)
    )

    // Reiniciar con nueva configuración
    if (this.isRunning) {
      await this.stop()
      await this.start()
    }
  }

  getConfig(): BackgroundSyncConfig {
    return { ...this.config }
  }

  async getLastSyncInfo(): Promise<{
    lastBackgroundSync?: Date
    lastForegroundActivation: Date
    queueLength: number
    isRunning: boolean
  }> {
    const lastBackgroundSyncStr = await AsyncStorage.getItem(
      'last_background_sync'
    )
    const lastBackgroundSync = lastBackgroundSyncStr
      ? new Date(lastBackgroundSyncStr)
      : undefined

    const bankingStore = useBankingStore.getState()

    return {
      lastBackgroundSync,
      lastForegroundActivation: this.lastForegroundTime,
      queueLength: bankingStore.transactionQueue.length,
      isRunning: this.isRunning
    }
  }

  async manualSync(): Promise<void> {
    await this.triggerSync('manual')
  }

  enable(): void {
    this.updateConfig({ enabled: true })
  }

  disable(): void {
    this.updateConfig({ enabled: false })
    this.stop()
  }

  // Cleanup al destruir
  destroy(): void {
    this.stop()

    if (this.appStateSubscription) {
      this.appStateSubscription.remove()
      this.appStateSubscription = null
    }
  }
}

// Instancia singleton
export const backgroundSyncService = BackgroundSyncService.getInstance()

// Helper hooks
export const useBackgroundSync = () => {
  const service = BackgroundSyncService.getInstance()

  return {
    start: () => service.start(),
    stop: () => service.stop(),
    manualSync: () => service.manualSync(),
    updateConfig: (config: Partial<BackgroundSyncConfig>) =>
      service.updateConfig(config),
    getConfig: () => service.getConfig(),
    getLastSyncInfo: () => service.getLastSyncInfo(),
    enable: () => service.enable(),
    disable: () => service.disable()
  }
}
