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

export interface BankAccount {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  currency: string
  lastSync: Date
}

export interface BankTransaction {
  id: string
  accountId: string
  amount: number
  description: string
  date: Date
  category?: string
  merchant?: string
  isReconciled: boolean
}

export interface BankCredentials {
  bankId: string
  username: string
  password: string
}

export type PaymentMethod = 'card' | 'cash' | 'transfer'
export type Period = 'week' | 'month' | 'year'
export type Theme = 'light' | 'dark'
export type ConnectionStatus = 'connected' | 'disconnected' | 'error'
