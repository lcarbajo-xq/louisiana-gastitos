// Tipos para funcionalidades avanzadas del sistema de gastos

// Presupuestos inteligentes
export interface SmartBudget {
  id: string
  categoryId: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  alertThresholds: {
    warning: number // Porcentaje (ej: 80)
    danger: number // Porcentaje (ej: 95)
  }
  smartAdjustment: boolean // Se ajusta automáticamente basado en patrones
  historicalAverage: number
  createdAt: Date
  updatedAt: Date
}

// Alertas del sistema
export interface BudgetAlert {
  id: string
  budgetId: string
  type: 'warning' | 'danger' | 'exceeded' | 'unusual_spending' | 'prediction'
  message: string
  amount: number
  percentage: number
  date: Date
  isRead: boolean
  actionRequired: boolean
}

// Predicciones ML
export interface SpendingPrediction {
  categoryId: string
  predictedAmount: number
  confidence: number // 0-1
  period: 'week' | 'month'
  basedOnDays: number
  factors: {
    historical: number
    seasonal: number
    trending: number
  }
  generatedAt: Date
}

// Análisis de patrones
export interface SpendingPattern {
  id: string
  type: 'location' | 'time' | 'day_of_week' | 'merchant'
  pattern: string
  frequency: number
  averageAmount: number
  categoryDistribution: Record<string, number>
  timeframe: {
    start: Date
    end: Date
  }
}

// Comparación demográfica
export interface DemographicComparison {
  userId: string
  ageGroup: string
  incomeRange: string
  location: string
  categoryAverages: Record<
    string,
    {
      userAverage: number
      demographicAverage: number
      percentile: number
    }
  >
  overallScore: number // 0-100
  lastUpdated: Date
}

// Metas de ahorro
export interface SavingsGoal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  category: 'emergency' | 'vacation' | 'purchase' | 'investment' | 'other'
  priority: 'low' | 'medium' | 'high'
  automaticContribution?: {
    enabled: boolean
    amount: number
    frequency: 'daily' | 'weekly' | 'monthly'
    sourceAccount?: string
  }
  milestones: {
    percentage: number
    reward?: string
    achieved: boolean
    achievedDate?: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

// Gastos compartidos
export interface SharedExpense {
  id: string
  expenseId: string
  shareType: 'equal' | 'percentage' | 'fixed'
  participants: {
    userId: string
    name: string
    email: string
    amount: number
    paid: boolean
    paidDate?: Date
  }[]
  creatorId: string
  totalAmount: number
  description: string
  splitMethod: 'even' | 'by_percentage' | 'by_amount'
  status: 'pending' | 'partially_paid' | 'completed'
  dueDate?: Date
  createdAt: Date
}

// Familia/Pareja
export interface FamilyGroup {
  id: string
  name: string
  members: {
    userId: string
    name: string
    email: string
    role: 'admin' | 'member' | 'viewer'
    joinedAt: Date
  }[]
  sharedBudgets: string[] // IDs de presupuestos compartidos
  sharedGoals: string[] // IDs de metas compartidas
  settings: {
    allowMemberAddExpenses: boolean
    requireApprovalForLargeExpenses: boolean
    largeExpenseThreshold: number
    defaultCurrency: string
  }
  createdAt: Date
}

// Reportes automáticos
export interface AutoReport {
  id: string
  name: string
  type: 'weekly' | 'monthly' | 'quarterly'
  recipients: string[] // emails
  template: 'summary' | 'detailed' | 'categories' | 'custom'
  includeSections: {
    overview: boolean
    categoryBreakdown: boolean
    budgetStatus: boolean
    savings: boolean
    predictions: boolean
    recommendations: boolean
  }
  schedule: {
    dayOfWeek?: number // 0-6 para reportes semanales
    dayOfMonth?: number // 1-31 para reportes mensuales
    time: string // HH:MM
  }
  isActive: boolean
  lastSent?: Date
  createdAt: Date
}

// Exportación de datos
export interface DataExport {
  id: string
  format: 'csv' | 'excel' | 'pdf' | 'json'
  type: 'expenses' | 'budgets' | 'reports' | 'full'
  dateRange: {
    start: Date
    end: Date
  }
  filters?: {
    categories?: string[]
    minAmount?: number
    maxAmount?: number
    includeShared?: boolean
  }
  status: 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  createdAt: Date
  expiresAt: Date
}

// Integración con Google Sheets
export interface GoogleSheetsIntegration {
  id: string
  spreadsheetId: string
  spreadsheetName: string
  sheetNames: string[]
  syncType: 'manual' | 'automatic'
  syncFrequency?: 'daily' | 'weekly' | 'monthly'
  lastSync?: Date
  mappings: {
    expenses: {
      sheetName: string
      columns: Record<string, string> // field -> column
    }
    budgets?: {
      sheetName: string
      columns: Record<string, string>
    }
  }
  isActive: boolean
  authToken: string // Encriptado
  createdAt: Date
}

// API pública
export interface ApiKey {
  id: string
  name: string
  key: string // Hash del key real
  permissions: {
    read: boolean
    write: boolean
    delete: boolean
  }
  rateLimit: number // requests por minuto
  isActive: boolean
  lastUsed?: Date
  usageCount: number
  createdAt: Date
  expiresAt?: Date
}

export interface ApiUsage {
  keyId: string
  endpoint: string
  method: string
  timestamp: Date
  responseCode: number
  responseTime: number
}

// Recomendaciones de optimización
export interface OptimizationRecommendation {
  id: string
  type:
    | 'budget_increase'
    | 'budget_decrease'
    | 'category_merge'
    | 'spending_alert'
    | 'savings_opportunity'
  title: string
  description: string
  category?: string
  impact: 'low' | 'medium' | 'high'
  potentialSavings?: number
  actionRequired: string
  isImplemented: boolean
  implementedAt?: Date
  generatedAt: Date
}
