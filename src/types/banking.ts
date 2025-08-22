// Tipos para cuentas bancarias
export interface BankAccount {
  id: string
  bankName: string
  accountType: 'checking' | 'savings' | 'credit' | 'investment'
  accountNumber: string // Últimos 4 dígitos
  balance: number
  currency: string
  isActive: boolean
  connectionId: string // ID de conexión con el proveedor (Plaid, etc.)
  lastSyncDate?: Date
  bankLogo?: string
  metadata?: {
    bankId: string
    institutionName: string
    accountMask: string
    subtype?: string
  }
}

// Tipos para transacciones bancarias
export interface BankTransaction {
  id: string
  accountId: string
  amount: number
  description: string
  merchantName?: string
  category?: string[]
  subcategory?: string
  date: Date
  pending: boolean
  transactionType: 'debit' | 'credit'
  paymentChannel: 'online' | 'in store' | 'atm' | 'other'
  location?: {
    address?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
    lat?: number
    lon?: number
  }
  merchantCategoryCode?: string
  originalDescription: string
  isoDCurrencyCode: string
  unofficialCurrencyCode?: string
  checkNumber?: string
  personalFinanceCategory?: {
    primary: string
    detailed: string
  }
  // Campos para reconciliación
  expenseId?: string // Si ya está vinculado a un gasto
  reconciliationStatus: 'unmatched' | 'matched' | 'ignored' | 'manual'
  reconciliationConfidence?: number // 0-1, qué tan seguro está el matching automático
  matchingSuggestions?: string[] // IDs de gastos que podrían coincidir
}

// Credenciales para conexión bancaria
export interface BankCredentials {
  institutionId: string
  username?: string
  password?: string
  pin?: string
  // Para OAuth
  publicToken?: string
  // Para Open Banking
  consentId?: string
  accessToken?: string
  refreshToken?: string
}

// Estado de conexión bancaria
export interface BankConnection {
  id: string
  institutionId: string
  institutionName: string
  accounts: string[] // IDs de cuentas
  status: 'connected' | 'disconnected' | 'error' | 'reauth_required'
  lastSync: Date
  errorMessage?: string
  provider: 'plaid' | 'open_banking' | 'manual'
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
}

// Configuración de sincronización
export interface SyncConfig {
  autoSync: boolean
  syncInterval: number // en minutos
  lastSyncAttempt?: Date
  failedAttempts: number
  maxRetries: number
  backoffMultiplier: number
}

// Queue de transacciones para modo offline
export interface TransactionQueueItem {
  id: string
  type: 'sync' | 'reconcile' | 'ignore' | 'manual_match'
  data: any
  timestamp: Date
  retryCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

// Configuración de seguridad
export interface SecurityConfig {
  biometricEnabled: boolean
  autoLogoutMinutes: number
  encryptionEnabled: boolean
  requireBiometricForBanking: boolean
  lastActivity?: Date
}

// Tipos para machine learning de categorización
export interface TransactionPattern {
  merchantName: string
  description: string
  amount: number
  suggestedCategory: string
  confidence: number
  frequency: number // cuántas veces hemos visto transacciones similares
}

// Alertas de sincronización
export interface SyncAlert {
  id: string
  type:
    | 'new_transactions'
    | 'duplicate_detected'
    | 'auth_required'
    | 'sync_failed'
  title: string
  message: string
  data?: any
  timestamp: Date
  read: boolean
  actionRequired: boolean
}

// Estado de reconciliación
export interface ReconciliationState {
  pendingMatches: {
    transactionId: string
    suggestions: {
      expenseId: string
      confidence: number
      reason: string
    }[]
  }[]
  autoMatchThreshold: number // 0-1, umbral de confianza para match automático
  conflictsToResolve: {
    transactionId: string
    conflictType: 'duplicate' | 'amount_mismatch' | 'date_mismatch'
    details: string
  }[]
}

// Webhook payload types
export interface PlaidWebhookPayload {
  webhook_type: 'TRANSACTIONS' | 'AUTH' | 'IDENTITY' | 'INCOME' | 'ASSETS'
  webhook_code: string
  item_id: string
  error?: {
    error_type: string
    error_code: string
    error_message: string
  }
  new_transactions?: number
  removed_transactions?: string[]
}

// Respuesta de APIs
export interface BankingApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    totalCount?: number
    hasMore?: boolean
    nextCursor?: string
  }
}

// Estadísticas de sincronización
export interface SyncStats {
  totalTransactions: number
  newTransactions: number
  matchedTransactions: number
  duplicatesFound: number
  lastSyncDuration: number // en ms
  averageSyncTime: number // en ms
  successRate: number // 0-1
}
