export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: Date
  paymentMethod?: PaymentMethod
  receipt?: string // URL de imagen
  location?: string
  tags?: string[]
}

export interface ExpenseCategory {
  id: string
  name: string
  icon: string
  color: string
  budget?: number
  isDefault?: boolean
  isActive?: boolean
  keywords?: string[] // Para ML categorization
  createdAt?: Date
  updatedAt?: Date
}

export interface CategoryStats {
  categoryId: string
  totalSpent: number
  transactionCount: number
  averageAmount: number
  lastUsed?: Date
  monthlyTrend: number // percentage change from last month
}

export interface CategoryFilter {
  name?: string
  minBudget?: number
  maxBudget?: number
  isActive?: boolean
  hasTransactions?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface MLCategoryPrediction {
  categoryId: string
  confidence: number
  matchedKeywords: string[]
  reasoning?: string
}

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  count: number
  color: string
}

export interface BudgetStatus {
  categoryId: string
  spent: number
  budget: number
  remaining: number
  isOverBudget: boolean
  percentage: number
}

export interface MonthlyStats {
  totalExpenses: number
  categoryBreakdown: CategoryBreakdown[]
  comparedToLastMonth: number
  budgetStatus: BudgetStatus[]
}

export type PaymentMethod = 'card' | 'cash' | 'transfer'
export type Period = 'week' | 'month' | 'year'
export type Theme = 'light' | 'dark'
export type ConnectionStatus = 'connected' | 'disconnected' | 'error'
