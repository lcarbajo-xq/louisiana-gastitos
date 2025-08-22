import { useCallback, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useBankingStore } from '../store/bankingStore'
import type { BankAccount, SyncAlert } from '../types/banking'

/**
 * Hook para gestionar conexiones bancarias
 */
export const useBankingConnection = () => {
  const {
    isConnecting,
    connectionStatus,
    connectAccount,
    disconnectAccount,
    reconnectAccount,
    connections,
    accounts
  } = useBankingStore()

  const { isAuthenticated, authenticate } = useAuthStore()

  const connectWithAuth = useCallback(
    async (credentials: any) => {
      if (!isAuthenticated) {
        const authSuccess = await authenticate()
        if (!authSuccess) return false
      }

      return await connectAccount(credentials)
    },
    [isAuthenticated, authenticate, connectAccount]
  )

  const disconnectWithAuth = useCallback(
    async (accountId: string) => {
      if (!isAuthenticated) {
        const authSuccess = await authenticate()
        if (!authSuccess) return
      }

      await disconnectAccount(accountId)
    },
    [isAuthenticated, authenticate, disconnectAccount]
  )

  const getActiveConnections = useCallback(() => {
    return connections.filter((conn) => conn.status === 'connected')
  }, [connections])

  const getActiveAccounts = useCallback(() => {
    return accounts.filter((acc) => acc.isActive)
  }, [accounts])

  return {
    isConnecting,
    connectionStatus,
    connections,
    accounts,
    connectAccount: connectWithAuth,
    disconnectAccount: disconnectWithAuth,
    reconnectAccount,
    getActiveConnections,
    getActiveAccounts
  }
}

/**
 * Hook para sincronización de transacciones
 */
export const useBankingSync = () => {
  const {
    isSyncing,
    lastSyncDate,
    syncConfig,
    syncStats,
    syncTransactions,
    syncAllAccounts,
    enableAutoSync,
    updateSyncConfig
  } = useBankingStore()

  const { isAuthenticated } = useAuthStore()

  const syncWithAuth = useCallback(
    async (accountId?: string) => {
      if (!isAuthenticated) return

      if (accountId) {
        await syncTransactions(accountId)
      } else {
        await syncAllAccounts()
      }
    },
    [isAuthenticated, syncTransactions, syncAllAccounts]
  )

  const enableAutoSyncWithConfig = useCallback(
    (enabled: boolean, intervalMinutes?: number) => {
      enableAutoSync(enabled)

      if (intervalMinutes) {
        updateSyncConfig({ syncInterval: intervalMinutes })
      }
    },
    [enableAutoSync, updateSyncConfig]
  )

  // Auto-sync cuando la app vuelve al foreground
  useEffect(() => {
    if (syncConfig.autoSync && isAuthenticated && !isSyncing) {
      const now = new Date()
      const lastSync = lastSyncDate || new Date(0)
      const timeSinceLastSync = now.getTime() - lastSync.getTime()
      const syncIntervalMs = syncConfig.syncInterval * 60 * 1000

      if (timeSinceLastSync > syncIntervalMs) {
        syncWithAuth()
      }
    }
  }, [syncConfig, isAuthenticated, isSyncing, lastSyncDate, syncWithAuth])

  const getSyncStatus = useCallback(() => {
    if (isSyncing) return 'syncing'
    if (!lastSyncDate) return 'never'

    const now = new Date()
    const timeSinceSync = now.getTime() - lastSyncDate.getTime()
    const hours = timeSinceSync / (1000 * 60 * 60)

    if (hours < 1) return 'recent'
    if (hours < 24) return 'today'
    return 'outdated'
  }, [isSyncing, lastSyncDate])

  return {
    isSyncing,
    lastSyncDate,
    syncConfig,
    syncStats,
    syncTransactions: syncWithAuth,
    syncAllAccounts: () => syncWithAuth(),
    enableAutoSync: enableAutoSyncWithConfig,
    updateSyncConfig,
    getSyncStatus
  }
}

/**
 * Hook para gestión de transacciones bancarias
 */
export const useBankTransactions = (accountId?: string) => {
  const {
    transactions,
    getTransactionsByAccount,
    getRecentTransactions,
    reconcileTransaction,
    markTransactionAsIgnored,
    suggestMatches
  } = useBankingStore()

  const filteredTransactions = accountId
    ? getTransactionsByAccount(accountId)
    : transactions

  const getUnmatchedTransactions = useCallback(() => {
    return filteredTransactions.filter(
      (tx) => tx.reconciliationStatus === 'unmatched'
    )
  }, [filteredTransactions])

  const getMatchedTransactions = useCallback(() => {
    return filteredTransactions.filter(
      (tx) => tx.reconciliationStatus === 'matched'
    )
  }, [filteredTransactions])

  const getPendingTransactions = useCallback(() => {
    return filteredTransactions.filter((tx) => tx.pending)
  }, [filteredTransactions])

  const getTransactionsByCategory = useCallback(
    (category: string) => {
      return filteredTransactions.filter((tx) =>
        tx.category?.some((cat) =>
          cat.toLowerCase().includes(category.toLowerCase())
        )
      )
    },
    [filteredTransactions]
  )

  const getTransactionsByMerchant = useCallback(
    (merchantName: string) => {
      return filteredTransactions.filter((tx) =>
        tx.merchantName?.toLowerCase().includes(merchantName.toLowerCase())
      )
    },
    [filteredTransactions]
  )

  const reconcileWithExpense = useCallback(
    async (transactionId: string, expenseId?: string) => {
      const transaction = transactions.find((tx) => tx.id === transactionId)
      if (!transaction) return

      await reconcileTransaction(transaction, expenseId)
    },
    [transactions, reconcileTransaction]
  )

  return {
    transactions: filteredTransactions,
    recentTransactions: getRecentTransactions(),
    unmatchedTransactions: getUnmatchedTransactions(),
    matchedTransactions: getMatchedTransactions(),
    pendingTransactions: getPendingTransactions(),
    getTransactionsByCategory,
    getTransactionsByMerchant,
    reconcileTransaction: reconcileWithExpense,
    markAsIgnored: markTransactionAsIgnored,
    suggestMatches
  }
}

/**
 * Hook para gestión de cuentas bancarias
 */
export const useBankAccounts = () => {
  const { accounts, getAccountBalance, getTotalBalance } = useBankingStore()

  const getAccountsByType = useCallback(
    (type: BankAccount['accountType']) => {
      return accounts.filter((acc) => acc.accountType === type && acc.isActive)
    },
    [accounts]
  )

  const getAccountsByBank = useCallback(
    (bankName: string) => {
      return accounts.filter(
        (acc) =>
          acc.bankName.toLowerCase().includes(bankName.toLowerCase()) &&
          acc.isActive
      )
    },
    [accounts]
  )

  const getAccountSummary = useCallback(() => {
    const activeAccounts = accounts.filter((acc) => acc.isActive)

    return {
      totalAccounts: activeAccounts.length,
      totalBalance: getTotalBalance(),
      checkingAccounts: activeAccounts.filter(
        (acc) => acc.accountType === 'checking'
      ).length,
      savingsAccounts: activeAccounts.filter(
        (acc) => acc.accountType === 'savings'
      ).length,
      creditAccounts: activeAccounts.filter(
        (acc) => acc.accountType === 'credit'
      ).length,
      lastSync: Math.max(
        ...activeAccounts.map((acc) => acc.lastSyncDate?.getTime() || 0)
      )
    }
  }, [accounts, getTotalBalance])

  return {
    accounts: accounts.filter((acc) => acc.isActive),
    allAccounts: accounts,
    getAccountsByType,
    getAccountsByBank,
    getAccountBalance,
    getTotalBalance,
    getAccountSummary
  }
}

/**
 * Hook para gestión de alertas y notificaciones
 */
export const useBankingAlerts = () => {
  const { alerts, addAlert, markAlertAsRead, clearAlerts, getUnreadAlerts } =
    useBankingStore()

  const unreadAlerts = getUnreadAlerts()

  const getAlertsByType = useCallback(
    (type: SyncAlert['type']) => {
      return alerts.filter((alert) => alert.type === type)
    },
    [alerts]
  )

  const getActionRequiredAlerts = useCallback(() => {
    return alerts.filter((alert) => alert.actionRequired && !alert.read)
  }, [alerts])

  const markAllAsRead = useCallback(() => {
    alerts.forEach((alert) => {
      if (!alert.read) {
        markAlertAsRead(alert.id)
      }
    })
  }, [alerts, markAlertAsRead])

  return {
    alerts,
    unreadAlerts,
    unreadCount: unreadAlerts.length,
    actionRequiredAlerts: getActionRequiredAlerts(),
    getAlertsByType,
    addAlert,
    markAlertAsRead,
    markAllAsRead,
    clearAlerts
  }
}

/**
 * Hook para reconciliación automática
 */
export const useBankingReconciliation = () => {
  const { reconciliationState, autoReconcileTransactions, transactions } =
    useBankingStore()

  const { isAuthenticated } = useAuthStore()

  const runAutoReconciliation = useCallback(async () => {
    if (!isAuthenticated) return

    await autoReconcileTransactions()
  }, [isAuthenticated, autoReconcileTransactions])

  const getPendingReconciliations = useCallback(() => {
    return reconciliationState.pendingMatches
  }, [reconciliationState])

  const getConflicts = useCallback(() => {
    return reconciliationState.conflictsToResolve
  }, [reconciliationState])

  const getReconciliationStats = useCallback(() => {
    const total = transactions.length
    const matched = transactions.filter(
      (tx) => tx.reconciliationStatus === 'matched'
    ).length
    const unmatched = transactions.filter(
      (tx) => tx.reconciliationStatus === 'unmatched'
    ).length
    const ignored = transactions.filter(
      (tx) => tx.reconciliationStatus === 'ignored'
    ).length

    return {
      total,
      matched,
      unmatched,
      ignored,
      matchedPercentage: total > 0 ? (matched / total) * 100 : 0
    }
  }, [transactions])

  return {
    reconciliationState,
    runAutoReconciliation,
    getPendingReconciliations,
    getConflicts,
    getReconciliationStats
  }
}

/**
 * Hook principal que combina toda la funcionalidad bancaria
 */
export const useBanking = () => {
  const banking = useBankingStore()
  const auth = useAuthStore()

  const connection = useBankingConnection()
  const sync = useBankingSync()
  const transactions = useBankTransactions()
  const accounts = useBankAccounts()
  const alerts = useBankingAlerts()
  const reconciliation = useBankingReconciliation()

  // Inicializar cuando se autentica
  useEffect(() => {
    if (auth.isAuthenticated) {
      banking.initialize()
    }
  }, [auth.isAuthenticated, banking])

  const isReady = !banking.isConnecting && !auth.isInitializing

  return {
    // Estados generales
    isReady,
    isAuthenticated: auth.isAuthenticated,

    // Funcionalidades específicas
    connection,
    sync,
    transactions,
    accounts,
    alerts,
    reconciliation,

    // Acceso directo a stores
    banking,
    auth
  }
}
