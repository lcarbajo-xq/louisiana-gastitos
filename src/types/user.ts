// Tipos para usuarios y funcionalidades compartidas

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  joinedAt: Date
  lastActive: Date
  preferences: {
    currency: string
    notifications: boolean
    theme: 'light' | 'dark' | 'auto'
    language: string
  }
  isActive: boolean
}

export interface UserRegistration {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface UserSession {
  user: User
  token: string
  refreshToken: string
  expiresAt: Date
}

export interface SharedBudget {
  id: string
  name: string
  description?: string
  totalAmount: number
  period: 'weekly' | 'monthly' | 'yearly'
  categoryId: string

  // Usuarios participantes
  participants: {
    userId: string
    name: string
    email: string
    role: 'owner' | 'editor' | 'viewer'
    allocatedAmount: number
    spentAmount: number
    joinedAt: Date
  }[]

  // Control de acceso
  createdBy: string
  permissions: {
    canAddExpenses: boolean
    canEditBudget: boolean
    canInviteUsers: boolean
    requireApproval: boolean
  }

  // Configuración de alertas
  alertThresholds: {
    warning: number // 80%
    danger: number // 95%
  }

  // Estados
  status: 'active' | 'paused' | 'completed' | 'archived'
  isPublic: boolean

  // Fechas
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface BudgetInvitation {
  id: string
  budgetId: string
  invitedBy: string
  invitedEmail: string
  role: 'editor' | 'viewer'
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: Date
  respondedAt?: Date
  expiresAt: Date
}

export interface BudgetActivity {
  id: string
  budgetId: string
  userId: string
  userName: string
  action:
    | 'created'
    | 'updated'
    | 'added_expense'
    | 'deleted_expense'
    | 'invited_user'
    | 'left_budget'
  description: string
  metadata?: Record<string, any>
  timestamp: Date
}

export interface SharedExpense {
  id: string
  budgetId: string
  amount: number
  description: string
  categoryId: string
  date: Date

  // Usuario que añadió el gasto
  addedBy: string
  addedByName: string

  // Recibo/evidencia
  receipt?: {
    url: string
    filename: string
    uploadedAt: Date
  }

  // Aprobación (si está habilitada)
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: Date
  rejectedBy?: string
  rejectedAt?: Date
  rejectionReason?: string

  // Metadatos
  location?: string
  tags?: string[]
  notes?: string

  createdAt: Date
  updatedAt: Date
}
