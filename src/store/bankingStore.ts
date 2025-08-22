import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { SecureStorageService } from '../services/SecureStorageService'
import type {
  BankAccount,
  BankConnection,
  BankCredentials,
  BankTransaction,
  ReconciliationState,
  SyncAlert,
  SyncConfig,
  SyncStats,
  TransactionQueueItem
} from '../types/banking'
import { useAuthStore } from './authStore'

interface BankingState {
  // Datos bancarios
  accounts: BankAccount[]
  transactions: BankTransaction[]
  connections: BankConnection[]

  // Estado de sincronización
  isConnecting: boolean
  isSyncing: boolean
  connectionStatus: 'idle' | 'connecting' | 'syncing' | 'connected' | 'error'
  lastSyncDate?: Date
  syncConfig: SyncConfig
  syncStats: SyncStats

  // Queue para operaciones offline
  transactionQueue: TransactionQueueItem[]

  // Estado de reconciliación
  reconciliationState: ReconciliationState

  // Alertas y notificaciones
  alerts: SyncAlert[]

  // Métodos principales
  initialize: () => Promise<void>

  // Conexión de cuentas bancarias
  connectAccount: (credentials: BankCredentials) => Promise<boolean>
  disconnectAccount: (accountId: string) => Promise<void>
  reconnectAccount: (connectionId: string) => Promise<boolean>

  // Sincronización
  syncTransactions: (accountId?: string) => Promise<void>
  syncAllAccounts: () => Promise<void>
  enableAutoSync: (enabled: boolean) => void
  updateSyncConfig: (config: Partial<SyncConfig>) => void

  // Gestión de transacciones
  addTransaction: (transaction: Omit<BankTransaction, 'id'>) => void
  updateTransaction: (id: string, updates: Partial<BankTransaction>) => void
  deleteTransaction: (id: string) => void
  getTransactionsByAccount: (accountId: string) => BankTransaction[]
  getRecentTransactions: (days?: number) => BankTransaction[]

  // Reconciliación con gastos manuales
  reconcileTransaction: (
    bankTx: BankTransaction,
    expenseId?: string
  ) => Promise<void>
  suggestMatches: (transactionId: string) => Promise<string[]>
  autoReconcileTransactions: () => Promise<void>
  markTransactionAsIgnored: (transactionId: string) => void

  // Queue management
  addToQueue: (
    item: Omit<
      TransactionQueueItem,
      'id' | 'timestamp' | 'retryCount' | 'status'
    >
  ) => void
  processQueue: () => Promise<void>
  clearQueue: () => void

  // Gestión de alertas
  addAlert: (alert: Omit<SyncAlert, 'id' | 'timestamp'>) => void
  markAlertAsRead: (alertId: string) => void
  clearAlerts: () => void
  getUnreadAlerts: () => SyncAlert[]

  // Utilidades
  getAccountBalance: (accountId: string) => number
  getTotalBalance: () => number
  getConnectionStatus: (connectionId: string) => BankConnection | null
  validateConnection: (connectionId: string) => Promise<boolean>
  validateAllConnections: () => Promise<void>
  saveToSecureStorage: () => Promise<void>

  // Estadísticas
  updateSyncStats: (stats: Partial<SyncStats>) => void
  getSyncHistory: () => SyncStats
}

const secureStorage = SecureStorageService.getInstance()

// Configuración inicial
const initialSyncConfig: SyncConfig = {
  autoSync: true,
  syncInterval: 60, // 1 hora
  failedAttempts: 0,
  maxRetries: 3,
  backoffMultiplier: 2
}

const initialSyncStats: SyncStats = {
  totalTransactions: 0,
  newTransactions: 0,
  matchedTransactions: 0,
  duplicatesFound: 0,
  lastSyncDuration: 0,
  averageSyncTime: 0,
  successRate: 1
}

const initialReconciliationState: ReconciliationState = {
  pendingMatches: [],
  autoMatchThreshold: 0.8,
  conflictsToResolve: []
}

export const useBankingStore = create<BankingState>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      accounts: [],
      transactions: [],
      connections: [],

      isConnecting: false,
      isSyncing: false,
      connectionStatus: 'idle',
      syncConfig: initialSyncConfig,
      syncStats: initialSyncStats,

      transactionQueue: [],
      reconciliationState: initialReconciliationState,
      alerts: [],

      // Inicialización
      initialize: async () => {
        try {
          // Cargar datos encriptados
          const [accounts, transactions, connections] = await Promise.all([
            secureStorage.getEncryptedBankingData<BankAccount[]>('accounts'),
            secureStorage.getEncryptedBankingData<BankTransaction[]>(
              'transactions'
            ),
            secureStorage.getEncryptedBankingData<BankConnection[]>(
              'connections'
            )
          ])

          set((state) => {
            state.accounts = accounts || []
            state.transactions = transactions || []
            state.connections = connections || []
          })

          // Verificar conexiones activas
          await get().validateAllConnections()

          // Iniciar auto-sync si está habilitado
          if (get().syncConfig.autoSync) {
            setTimeout(() => {
              get().syncAllAccounts()
            }, 5000) // Delay inicial
          }
        } catch (error) {
          console.error('Banking store initialization failed:', error)
          get().addAlert({
            type: 'sync_failed',
            title: 'Initialization Error',
            message: 'Failed to load banking data',
            read: false,
            actionRequired: false
          })
        }
      },

      // Conexión de cuentas
      connectAccount: async (credentials: BankCredentials) => {
        set((state) => {
          state.isConnecting = true
          state.connectionStatus = 'connecting'
        })

        try {
          // Aquí iría la integración real con Plaid o Open Banking
          // Por ahora, simulamos una conexión exitosa

          // Simular delay de conexión
          await new Promise((resolve) => setTimeout(resolve, 2000))

          const newConnection: BankConnection = {
            id: `conn_${Date.now()}`,
            institutionId: credentials.institutionId,
            institutionName: 'Demo Bank', // Vendría de la API
            accounts: [], // Se llenarán después de obtener las cuentas
            status: 'connected',
            lastSync: new Date(),
            provider: 'plaid', // o el proveedor usado
            accessToken: 'demo_access_token', // Token real vendría de la API
            tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
          }

          // Simular cuentas obtenidas
          const newAccounts: BankAccount[] = [
            {
              id: `acc_${Date.now()}_1`,
              bankName: 'Demo Bank',
              accountType: 'checking',
              accountNumber: '****1234',
              balance: 2500.0,
              currency: 'USD',
              isActive: true,
              connectionId: newConnection.id,
              lastSyncDate: new Date(),
              metadata: {
                bankId: credentials.institutionId,
                institutionName: 'Demo Bank',
                accountMask: '1234'
              }
            }
          ]

          // Guardar token de forma segura
          await useAuthStore
            .getState()
            .setBankToken(newConnection.id, newConnection.accessToken)

          set((state) => {
            newConnection.accounts = newAccounts.map((acc) => acc.id)
            state.connections.push(newConnection)
            state.accounts.push(...newAccounts)
            state.connectionStatus = 'connected'
          })

          // Guardar en storage seguro
          await get().saveToSecureStorage()

          // Sincronizar transacciones iniciales
          await get().syncTransactions()

          get().addAlert({
            type: 'new_transactions',
            title: 'Account Connected',
            message: `Successfully connected to ${newConnection.institutionName}`,
            read: false,
            actionRequired: false
          })

          return true
        } catch (error) {
          console.error('Failed to connect account:', error)

          set((state) => {
            state.connectionStatus = 'error'
          })

          get().addAlert({
            type: 'auth_required',
            title: 'Connection Failed',
            message: 'Failed to connect to bank account',
            read: false,
            actionRequired: true
          })

          return false
        } finally {
          set((state) => {
            state.isConnecting = false
          })
        }
      },

      // Desconectar cuenta
      disconnectAccount: async (accountId: string) => {
        try {
          const account = get().accounts.find((acc) => acc.id === accountId)
          if (!account) return

          const connection = get().connections.find(
            (conn) => conn.id === account.connectionId
          )
          if (connection) {
            // Limpiar token
            await useAuthStore.getState().clearBankToken(connection.id)

            // Marcar conexión como desconectada
            set((state) => {
              const connIndex = state.connections.findIndex(
                (c) => c.id === connection.id
              )
              if (connIndex !== -1) {
                state.connections[connIndex].status = 'disconnected'
              }

              // Marcar cuenta como inactiva
              const accIndex = state.accounts.findIndex(
                (a) => a.id === accountId
              )
              if (accIndex !== -1) {
                state.accounts[accIndex].isActive = false
              }
            })

            await get().saveToSecureStorage()
          }
        } catch (error) {
          console.error('Failed to disconnect account:', error)
        }
      },

      // Sincronización de transacciones
      syncTransactions: async (accountId?: string) => {
        if (get().isSyncing) return

        set((state) => {
          state.isSyncing = true
          state.connectionStatus = 'syncing'
        })

        const startTime = Date.now()

        try {
          const accountsToSync = accountId
            ? get().accounts.filter((acc) => acc.id === accountId)
            : get().accounts.filter((acc) => acc.isActive)

          let totalNewTransactions = 0

          for (const account of accountsToSync) {
            const connection = get().connections.find(
              (c) => c.id === account.connectionId
            )
            if (!connection || connection.status !== 'connected') continue

            // Obtener token
            const token = await useAuthStore
              .getState()
              .getBankToken(connection.id)
            if (!token) {
              console.warn(`No token for connection ${connection.id}`)
              continue
            }

            // Simular obtención de transacciones (aquí iría la llamada real a la API)
            const mockTransactions: Omit<BankTransaction, 'id'>[] = [
              {
                accountId: account.id,
                amount: -25.99,
                description: 'STARBUCKS #123',
                merchantName: 'Starbucks',
                category: ['Food and Drink'],
                date: new Date(),
                pending: false,
                transactionType: 'debit',
                paymentChannel: 'in store',
                originalDescription: 'STARBUCKS #123',
                isoDCurrencyCode: 'USD',
                reconciliationStatus: 'unmatched'
              }
            ]

            // Procesar transacciones nuevas
            for (const txData of mockTransactions) {
              const existingTx = get().transactions.find(
                (tx) =>
                  tx.accountId === txData.accountId &&
                  tx.originalDescription === txData.originalDescription &&
                  Math.abs(tx.amount - txData.amount) < 0.01
              )

              if (!existingTx) {
                const newTransaction: BankTransaction = {
                  ...txData,
                  id: `tx_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`
                }

                set((state) => {
                  state.transactions.push(newTransaction)
                })

                totalNewTransactions++
              }
            }

            // Actualizar fecha de última sincronización
            set((state) => {
              const accIndex = state.accounts.findIndex(
                (a) => a.id === account.id
              )
              if (accIndex !== -1) {
                state.accounts[accIndex].lastSyncDate = new Date()
              }
            })
          }

          // Actualizar estadísticas
          const duration = Date.now() - startTime
          get().updateSyncStats({
            newTransactions: totalNewTransactions,
            lastSyncDuration: duration,
            averageSyncTime: (get().syncStats.averageSyncTime + duration) / 2
          })

          set((state) => {
            state.lastSyncDate = new Date()
            state.syncConfig.failedAttempts = 0
          })

          // Guardar cambios
          await get().saveToSecureStorage()

          // Intentar reconciliación automática
          await get().autoReconcileTransactions()

          if (totalNewTransactions > 0) {
            get().addAlert({
              type: 'new_transactions',
              title: 'New Transactions',
              message: `Found ${totalNewTransactions} new transactions`,
              read: false,
              actionRequired: false
            })
          }
        } catch (error) {
          console.error('Sync failed:', error)

          set((state) => {
            state.syncConfig.failedAttempts += 1
          })

          get().addAlert({
            type: 'sync_failed',
            title: 'Sync Failed',
            message: 'Failed to sync transactions',
            read: false,
            actionRequired: true
          })
        } finally {
          set((state) => {
            state.isSyncing = false
            state.connectionStatus = 'connected'
          })
        }
      },

      // Sincronizar todas las cuentas
      syncAllAccounts: async () => {
        await get().syncTransactions()
      },

      // Reconciliación automática
      autoReconcileTransactions: async () => {
        const unmatchedTransactions = get().transactions.filter(
          (tx) => tx.reconciliationStatus === 'unmatched'
        )

        // Aquí implementarías el algoritmo de matching automático
        // Por simplicidad, marcamos algunas como matched
        for (const tx of unmatchedTransactions) {
          if (Math.random() > 0.7) {
            // 30% de probabilidad de match automático
            set((state) => {
              const txIndex = state.transactions.findIndex(
                (t) => t.id === tx.id
              )
              if (txIndex !== -1) {
                state.transactions[txIndex].reconciliationStatus = 'matched'
                state.transactions[txIndex].reconciliationConfidence =
                  Math.random() * 0.3 + 0.7
              }
            })
          }
        }
      },

      // Gestión de alertas
      addAlert: (alert) => {
        const newAlert: SyncAlert = {
          ...alert,
          id: `alert_${Date.now()}`,
          timestamp: new Date()
        }

        set((state) => {
          state.alerts.unshift(newAlert)
          // Mantener solo las últimas 50 alertas
          if (state.alerts.length > 50) {
            state.alerts = state.alerts.slice(0, 50)
          }
        })
      },

      markAlertAsRead: (alertId) => {
        set((state) => {
          const alertIndex = state.alerts.findIndex(
            (alert) => alert.id === alertId
          )
          if (alertIndex !== -1) {
            state.alerts[alertIndex].read = true
          }
        })
      },

      getUnreadAlerts: () => {
        return get().alerts.filter((alert) => !alert.read)
      },

      clearAlerts: () => {
        set((state) => {
          state.alerts = []
        })
      },

      // Métodos auxiliares
      saveToSecureStorage: async () => {
        const { accounts, transactions, connections } = get()

        await Promise.all([
          secureStorage.setEncryptedBankingData('accounts', accounts),
          secureStorage.setEncryptedBankingData('transactions', transactions),
          secureStorage.setEncryptedBankingData('connections', connections)
        ])
      },

      validateAllConnections: async () => {
        const connections = get().connections

        for (const connection of connections) {
          const isValid = await get().validateConnection(connection.id)
          if (!isValid) {
            set((state) => {
              const connIndex = state.connections.findIndex(
                (c) => c.id === connection.id
              )
              if (connIndex !== -1) {
                state.connections[connIndex].status = 'error'
              }
            })
          }
        }
      },

      validateConnection: async (connectionId) => {
        try {
          const token = await useAuthStore.getState().getBankToken(connectionId)
          return token !== null
        } catch (error) {
          console.error('Connection validation failed:', error)
          return false
        }
      },

      // Implementar métodos restantes...
      reconnectAccount: async (connectionId) => {
        // TODO: Implementar reconexión
        return false
      },

      enableAutoSync: (enabled) => {
        set((state) => {
          state.syncConfig.autoSync = enabled
        })
      },

      updateSyncConfig: (config) => {
        set((state) => {
          state.syncConfig = { ...state.syncConfig, ...config }
        })
      },

      addTransaction: (transaction) => {
        const newTransaction: BankTransaction = {
          ...transaction,
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        set((state) => {
          state.transactions.push(newTransaction)
        })
      },

      updateTransaction: (id, updates) => {
        set((state) => {
          const txIndex = state.transactions.findIndex((tx) => tx.id === id)
          if (txIndex !== -1) {
            state.transactions[txIndex] = {
              ...state.transactions[txIndex],
              ...updates
            }
          }
        })
      },

      deleteTransaction: (id) => {
        set((state) => {
          state.transactions = state.transactions.filter((tx) => tx.id !== id)
        })
      },

      getTransactionsByAccount: (accountId) => {
        return get().transactions.filter((tx) => tx.accountId === accountId)
      },

      getRecentTransactions: (days = 30) => {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        return get().transactions.filter((tx) => tx.date >= cutoff)
      },

      reconcileTransaction: async (bankTx, expenseId) => {
        set((state) => {
          const txIndex = state.transactions.findIndex(
            (tx) => tx.id === bankTx.id
          )
          if (txIndex !== -1) {
            state.transactions[txIndex].expenseId = expenseId
            state.transactions[txIndex].reconciliationStatus = expenseId
              ? 'matched'
              : 'manual'
          }
        })
      },

      suggestMatches: async (transactionId) => {
        // TODO: Implementar algoritmo de sugerencias
        return []
      },

      markTransactionAsIgnored: (transactionId) => {
        get().updateTransaction(transactionId, {
          reconciliationStatus: 'ignored'
        })
      },

      addToQueue: (item) => {
        const queueItem: TransactionQueueItem = {
          ...item,
          id: `queue_${Date.now()}`,
          timestamp: new Date(),
          retryCount: 0,
          status: 'pending'
        }

        set((state) => {
          state.transactionQueue.push(queueItem)
        })
      },

      processQueue: async () => {
        // TODO: Implementar procesamiento de queue
      },

      clearQueue: () => {
        set((state) => {
          state.transactionQueue = []
        })
      },

      getAccountBalance: (accountId) => {
        const account = get().accounts.find((acc) => acc.id === accountId)
        return account?.balance || 0
      },

      getTotalBalance: () => {
        return get()
          .accounts.filter((acc) => acc.isActive)
          .reduce((total, acc) => total + acc.balance, 0)
      },

      getConnectionStatus: (connectionId) => {
        return (
          get().connections.find((conn) => conn.id === connectionId) || null
        )
      },

      updateSyncStats: (stats) => {
        set((state) => {
          state.syncStats = { ...state.syncStats, ...stats }
        })
      },

      getSyncHistory: () => {
        return get().syncStats
      }
    })),
    {
      name: 'banking-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name)
        }
      },
      // Solo persistir configuración no sensible
      partialize: (state) =>
        ({
          syncConfig: state.syncConfig,
          syncStats: state.syncStats,
          reconciliationState: state.reconciliationState,
          alerts: state.alerts.slice(-10) // Solo las últimas 10 alertas
        } as BankingState)
    }
  )
)
