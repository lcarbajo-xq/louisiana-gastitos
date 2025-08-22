import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  BudgetActivity,
  BudgetInvitation,
  SharedBudget,
  SharedExpense
} from '../types/user'
import { useUserStore } from './userStore'

interface SharedBudgetState {
  // Estado
  sharedBudgets: SharedBudget[]
  invitations: BudgetInvitation[]
  activities: BudgetActivity[]
  sharedExpenses: SharedExpense[]

  // Estados de carga
  isLoading: boolean
  isSyncing: boolean

  // Acciones de presupuestos
  createSharedBudget: (
    budgetData: Omit<
      SharedBudget,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'participants'
    >
  ) => Promise<string>
  updateSharedBudget: (
    budgetId: string,
    updates: Partial<SharedBudget>
  ) => Promise<boolean>
  deleteSharedBudget: (budgetId: string) => Promise<boolean>

  // Gestión de participantes
  inviteUserToBudget: (
    budgetId: string,
    email: string,
    role: 'editor' | 'viewer',
    message?: string
  ) => Promise<boolean>
  acceptInvitation: (invitationId: string) => Promise<boolean>
  declineInvitation: (invitationId: string) => Promise<boolean>
  removeUserFromBudget: (budgetId: string, userId: string) => Promise<boolean>
  updateUserRole: (
    budgetId: string,
    userId: string,
    role: 'editor' | 'viewer'
  ) => Promise<boolean>

  // Gastos compartidos
  addSharedExpense: (
    budgetId: string,
    expenseData: Omit<
      SharedExpense,
      'id' | 'createdAt' | 'updatedAt' | 'addedBy' | 'addedByName'
    >
  ) => Promise<boolean>
  updateSharedExpense: (
    expenseId: string,
    updates: Partial<SharedExpense>
  ) => Promise<boolean>
  deleteSharedExpense: (expenseId: string) => Promise<boolean>
  approveExpense: (expenseId: string) => Promise<boolean>
  rejectExpense: (expenseId: string, reason: string) => Promise<boolean>

  // Consultas
  getBudget: (budgetId: string) => SharedBudget | undefined
  getBudgetsForUser: (userId: string) => SharedBudget[]
  getBudgetExpenses: (budgetId: string) => SharedExpense[]
  getUserSpentAmount: (budgetId: string, userId: string) => number
  getBudgetActivity: (budgetId: string) => BudgetActivity[]
  getPendingInvitations: () => BudgetInvitation[]

  // Utilidades
  calculateBudgetUsage: (budgetId: string) => {
    totalSpent: number
    percentage: number
    remaining: number
    byParticipant: Record<string, number>
  }

  addActivity: (
    budgetId: string,
    action: BudgetActivity['action'],
    description: string,
    metadata?: Record<string, any>
  ) => void
  syncWithServer: () => Promise<void>
  resetStore: () => void
}

export const useSharedBudgetStore = create<SharedBudgetState>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      sharedBudgets: [],
      invitations: [],
      activities: [],
      sharedExpenses: [],
      isLoading: false,
      isSyncing: false,

      // Crear presupuesto compartido
      createSharedBudget: async (budgetData) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) throw new Error('Usuario no autenticado')

        set((state) => {
          state.isLoading = true
        })

        try {
          const budgetId = `shared_budget_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`

          const newBudget: SharedBudget = {
            ...budgetData,
            id: budgetId,
            createdBy: currentUser.id,
            participants: [
              {
                userId: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                role: 'owner',
                allocatedAmount: budgetData.totalAmount,
                spentAmount: 0,
                joinedAt: new Date()
              }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }

          set((state) => {
            state.sharedBudgets.push(newBudget)
          })

          // Agregar actividad
          get().addActivity(
            budgetId,
            'created',
            `${currentUser.name} creó el presupuesto "${budgetData.name}"`
          )

          return budgetId
        } catch (error) {
          console.error('Error creating shared budget:', error)
          throw error
        } finally {
          set((state) => {
            state.isLoading = false
          })
        }
      },

      // Actualizar presupuesto
      updateSharedBudget: async (budgetId, updates) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const budget = get().getBudget(budgetId)
          if (!budget) return false

          // Verificar permisos
          const userParticipant = budget.participants.find(
            (p) => p.userId === currentUser.id
          )
          if (
            !userParticipant ||
            (userParticipant.role === 'viewer' &&
              !budget.permissions.canEditBudget)
          ) {
            throw new Error('No tienes permisos para editar este presupuesto')
          }

          set((state) => {
            const budgetIndex = state.sharedBudgets.findIndex(
              (b) => b.id === budgetId
            )
            if (budgetIndex !== -1) {
              state.sharedBudgets[budgetIndex] = {
                ...state.sharedBudgets[budgetIndex],
                ...updates,
                updatedAt: new Date()
              }
            }
          })

          get().addActivity(
            budgetId,
            'updated',
            `${currentUser.name} actualizó el presupuesto`
          )
          return true
        } catch (error) {
          console.error('Error updating shared budget:', error)
          return false
        }
      },

      // Eliminar presupuesto
      deleteSharedBudget: async (budgetId) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const budget = get().getBudget(budgetId)
          if (!budget || budget.createdBy !== currentUser.id) {
            throw new Error('Solo el creador puede eliminar el presupuesto')
          }

          set((state) => {
            state.sharedBudgets = state.sharedBudgets.filter(
              (b) => b.id !== budgetId
            )
            state.sharedExpenses = state.sharedExpenses.filter(
              (e) => e.budgetId !== budgetId
            )
            state.activities = state.activities.filter(
              (a) => a.budgetId !== budgetId
            )
            state.invitations = state.invitations.filter(
              (i) => i.budgetId !== budgetId
            )
          })

          return true
        } catch (error) {
          console.error('Error deleting shared budget:', error)
          return false
        }
      },

      // Invitar usuario
      inviteUserToBudget: async (budgetId, email, role, message) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const budget = get().getBudget(budgetId)
          if (!budget) return false

          // Verificar permisos
          const userParticipant = budget.participants.find(
            (p) => p.userId === currentUser.id
          )
          if (
            !userParticipant ||
            (userParticipant.role === 'viewer' &&
              !budget.permissions.canInviteUsers)
          ) {
            throw new Error('No tienes permisos para invitar usuarios')
          }

          // Verificar que el usuario no esté ya en el presupuesto
          const existingParticipant = budget.participants.find(
            (p) => p.email === email
          )
          if (existingParticipant) {
            throw new Error('Este usuario ya está en el presupuesto')
          }

          const invitation: BudgetInvitation = {
            id: `invitation_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            budgetId,
            invitedBy: currentUser.id,
            invitedEmail: email,
            role,
            message,
            status: 'pending',
            sentAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
          }

          set((state) => {
            state.invitations.push(invitation)
          })

          get().addActivity(
            budgetId,
            'invited_user',
            `${currentUser.name} invitó a ${email}`
          )

          return true
        } catch (error) {
          console.error('Error inviting user:', error)
          return false
        }
      },

      // Aceptar invitación
      acceptInvitation: async (invitationId) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const invitation = get().invitations.find(
            (i) => i.id === invitationId
          )
          if (!invitation || invitation.invitedEmail !== currentUser.email) {
            throw new Error('Invitación no válida')
          }

          if (
            invitation.status !== 'pending' ||
            invitation.expiresAt < new Date()
          ) {
            throw new Error('Invitación expirada o ya procesada')
          }

          const budget = get().getBudget(invitation.budgetId)
          if (!budget) return false

          // Agregar usuario al presupuesto
          set((state) => {
            const budgetIndex = state.sharedBudgets.findIndex(
              (b) => b.id === invitation.budgetId
            )
            if (budgetIndex !== -1) {
              state.sharedBudgets[budgetIndex].participants.push({
                userId: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                role: invitation.role,
                allocatedAmount: 0, // Se puede configurar después
                spentAmount: 0,
                joinedAt: new Date()
              })
            }

            // Marcar invitación como aceptada
            const invitationIndex = state.invitations.findIndex(
              (i) => i.id === invitationId
            )
            if (invitationIndex !== -1) {
              state.invitations[invitationIndex].status = 'accepted'
              state.invitations[invitationIndex].respondedAt = new Date()
            }
          })

          get().addActivity(
            invitation.budgetId,
            'invited_user',
            `${currentUser.name} se unió al presupuesto`
          )

          return true
        } catch (error) {
          console.error('Error accepting invitation:', error)
          return false
        }
      },

      // Rechazar invitación
      declineInvitation: async (invitationId) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          set((state) => {
            const invitationIndex = state.invitations.findIndex(
              (i) => i.id === invitationId
            )
            if (invitationIndex !== -1) {
              state.invitations[invitationIndex].status = 'declined'
              state.invitations[invitationIndex].respondedAt = new Date()
            }
          })

          return true
        } catch (error) {
          console.error('Error declining invitation:', error)
          return false
        }
      },

      // Remover usuario del presupuesto
      removeUserFromBudget: async (budgetId, userId) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const budget = get().getBudget(budgetId)
          if (!budget) return false

          // Solo el creador o el mismo usuario pueden remover
          if (
            budget.createdBy !== currentUser.id &&
            userId !== currentUser.id
          ) {
            throw new Error('No tienes permisos para remover este usuario')
          }

          set((state) => {
            const budgetIndex = state.sharedBudgets.findIndex(
              (b) => b.id === budgetId
            )
            if (budgetIndex !== -1) {
              state.sharedBudgets[budgetIndex].participants =
                state.sharedBudgets[budgetIndex].participants.filter(
                  (p) => p.userId !== userId
                )
            }
          })

          const removedUser = useUserStore.getState().getUser(userId)
          get().addActivity(
            budgetId,
            'left_budget',
            `${removedUser?.name || 'Usuario'} salió del presupuesto`
          )

          return true
        } catch (error) {
          console.error('Error removing user:', error)
          return false
        }
      },

      // Actualizar rol de usuario
      updateUserRole: async (budgetId, userId, role) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const budget = get().getBudget(budgetId)
          if (!budget || budget.createdBy !== currentUser.id) {
            throw new Error('Solo el creador puede cambiar roles')
          }

          set((state) => {
            const budgetIndex = state.sharedBudgets.findIndex(
              (b) => b.id === budgetId
            )
            if (budgetIndex !== -1) {
              const participantIndex = state.sharedBudgets[
                budgetIndex
              ].participants.findIndex((p) => p.userId === userId)
              if (participantIndex !== -1) {
                state.sharedBudgets[budgetIndex].participants[
                  participantIndex
                ].role = role
              }
            }
          })

          return true
        } catch (error) {
          console.error('Error updating user role:', error)
          return false
        }
      },

      // Agregar gasto compartido
      addSharedExpense: async (budgetId, expenseData) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const budget = get().getBudget(budgetId)
          if (!budget) return false

          // Verificar permisos
          const userParticipant = budget.participants.find(
            (p) => p.userId === currentUser.id
          )
          if (
            !userParticipant ||
            (userParticipant.role === 'viewer' &&
              !budget.permissions.canAddExpenses)
          ) {
            throw new Error('No tienes permisos para agregar gastos')
          }

          const expenseId = `shared_expense_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`

          const newExpense: SharedExpense = {
            ...expenseData,
            id: expenseId,
            budgetId,
            addedBy: currentUser.id,
            addedByName: currentUser.name,
            requiresApproval:
              budget.permissions.requireApproval &&
              userParticipant.role !== 'owner',
            createdAt: new Date(),
            updatedAt: new Date()
          }

          set((state) => {
            state.sharedExpenses.push(newExpense)

            // Actualizar monto gastado del usuario si el gasto no requiere aprobación
            if (!newExpense.requiresApproval) {
              const budgetIndex = state.sharedBudgets.findIndex(
                (b) => b.id === budgetId
              )
              if (budgetIndex !== -1) {
                const participantIndex = state.sharedBudgets[
                  budgetIndex
                ].participants.findIndex((p) => p.userId === currentUser.id)
                if (participantIndex !== -1) {
                  state.sharedBudgets[budgetIndex].participants[
                    participantIndex
                  ].spentAmount += expenseData.amount
                }
              }
            }
          })

          get().addActivity(
            budgetId,
            'added_expense',
            `${currentUser.name} agregó un gasto de $${expenseData.amount} - ${expenseData.description}`
          )

          return true
        } catch (error) {
          console.error('Error adding shared expense:', error)
          return false
        }
      },

      // Actualizar gasto compartido
      updateSharedExpense: async (expenseId, updates) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const expense = get().sharedExpenses.find((e) => e.id === expenseId)
          if (!expense) return false

          // Solo el creador del gasto puede editarlo
          if (expense.addedBy !== currentUser.id) {
            throw new Error('Solo puedes editar tus propios gastos')
          }

          set((state) => {
            const expenseIndex = state.sharedExpenses.findIndex(
              (e) => e.id === expenseId
            )
            if (expenseIndex !== -1) {
              state.sharedExpenses[expenseIndex] = {
                ...state.sharedExpenses[expenseIndex],
                ...updates,
                updatedAt: new Date()
              }
            }
          })

          return true
        } catch (error) {
          console.error('Error updating shared expense:', error)
          return false
        }
      },

      // Eliminar gasto compartido
      deleteSharedExpense: async (expenseId) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const expense = get().sharedExpenses.find((e) => e.id === expenseId)
          if (!expense || expense.addedBy !== currentUser.id) {
            throw new Error('Solo puedes eliminar tus propios gastos')
          }

          set((state) => {
            state.sharedExpenses = state.sharedExpenses.filter(
              (e) => e.id !== expenseId
            )
          })

          get().addActivity(
            expense.budgetId,
            'deleted_expense',
            `${currentUser.name} eliminó un gasto`
          )

          return true
        } catch (error) {
          console.error('Error deleting shared expense:', error)
          return false
        }
      },

      // Aprobar gasto
      approveExpense: async (expenseId) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const expense = get().sharedExpenses.find((e) => e.id === expenseId)
          if (!expense) return false

          const budget = get().getBudget(expense.budgetId)
          if (!budget || budget.createdBy !== currentUser.id) {
            throw new Error(
              'Solo el creador del presupuesto puede aprobar gastos'
            )
          }

          set((state) => {
            const expenseIndex = state.sharedExpenses.findIndex(
              (e) => e.id === expenseId
            )
            if (expenseIndex !== -1) {
              state.sharedExpenses[expenseIndex].approvedBy = currentUser.id
              state.sharedExpenses[expenseIndex].approvedAt = new Date()

              // Actualizar monto gastado del usuario
              const budgetIndex = state.sharedBudgets.findIndex(
                (b) => b.id === expense.budgetId
              )
              if (budgetIndex !== -1) {
                const participantIndex = state.sharedBudgets[
                  budgetIndex
                ].participants.findIndex((p) => p.userId === expense.addedBy)
                if (participantIndex !== -1) {
                  state.sharedBudgets[budgetIndex].participants[
                    participantIndex
                  ].spentAmount += expense.amount
                }
              }
            }
          })

          return true
        } catch (error) {
          console.error('Error approving expense:', error)
          return false
        }
      },

      // Rechazar gasto
      rejectExpense: async (expenseId, reason) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return false

        try {
          const expense = get().sharedExpenses.find((e) => e.id === expenseId)
          if (!expense) return false

          const budget = get().getBudget(expense.budgetId)
          if (!budget || budget.createdBy !== currentUser.id) {
            throw new Error(
              'Solo el creador del presupuesto puede rechazar gastos'
            )
          }

          set((state) => {
            const expenseIndex = state.sharedExpenses.findIndex(
              (e) => e.id === expenseId
            )
            if (expenseIndex !== -1) {
              state.sharedExpenses[expenseIndex].rejectedBy = currentUser.id
              state.sharedExpenses[expenseIndex].rejectedAt = new Date()
              state.sharedExpenses[expenseIndex].rejectionReason = reason
            }
          })

          return true
        } catch (error) {
          console.error('Error rejecting expense:', error)
          return false
        }
      },

      // Obtener presupuesto
      getBudget: (budgetId) => {
        return get().sharedBudgets.find((budget) => budget.id === budgetId)
      },

      // Obtener presupuestos del usuario
      getBudgetsForUser: (userId) => {
        return get().sharedBudgets.filter((budget) =>
          budget.participants.some((p) => p.userId === userId)
        )
      },

      // Obtener gastos del presupuesto
      getBudgetExpenses: (budgetId) => {
        return get().sharedExpenses.filter(
          (expense) => expense.budgetId === budgetId
        )
      },

      // Obtener monto gastado por usuario
      getUserSpentAmount: (budgetId, userId) => {
        const budget = get().getBudget(budgetId)
        if (!budget) return 0

        const participant = budget.participants.find((p) => p.userId === userId)
        return participant?.spentAmount || 0
      },

      // Obtener actividad del presupuesto
      getBudgetActivity: (budgetId) => {
        return get()
          .activities.filter((activity) => activity.budgetId === budgetId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      },

      // Obtener invitaciones pendientes
      getPendingInvitations: () => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return []

        return get().invitations.filter(
          (invitation) =>
            invitation.invitedEmail === currentUser.email &&
            invitation.status === 'pending' &&
            invitation.expiresAt > new Date()
        )
      },

      // Calcular uso del presupuesto
      calculateBudgetUsage: (budgetId) => {
        const budget = get().getBudget(budgetId)
        if (!budget) {
          return {
            totalSpent: 0,
            percentage: 0,
            remaining: 0,
            byParticipant: {}
          }
        }

        const totalSpent = budget.participants.reduce(
          (sum, p) => sum + p.spentAmount,
          0
        )
        const percentage = (totalSpent / budget.totalAmount) * 100
        const remaining = budget.totalAmount - totalSpent

        const byParticipant: Record<string, number> = {}
        budget.participants.forEach((p) => {
          byParticipant[p.userId] = p.spentAmount
        })

        return {
          totalSpent,
          percentage: Math.min(percentage, 100),
          remaining: Math.max(remaining, 0),
          byParticipant
        }
      },

      // Agregar actividad
      addActivity: (budgetId, action, description, metadata) => {
        const currentUser = useUserStore.getState().currentUser
        if (!currentUser) return

        const activity: BudgetActivity = {
          id: `activity_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          budgetId,
          userId: currentUser.id,
          userName: currentUser.name,
          action,
          description,
          metadata,
          timestamp: new Date()
        }

        set((state) => {
          state.activities.push(activity)
        })
      },

      // Sincronizar con servidor (placeholder)
      syncWithServer: async () => {
        set((state) => {
          state.isSyncing = true
        })

        try {
          // En un sistema real, aquí se sincronizaría con el servidor
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          console.error('Sync failed:', error)
        } finally {
          set((state) => {
            state.isSyncing = false
          })
        }
      },

      // Reset del store
      resetStore: () => {
        set({
          sharedBudgets: [],
          invitations: [],
          activities: [],
          sharedExpenses: [],
          isLoading: false,
          isSyncing: false
        })
      }
    })),
    {
      name: 'shared-budget-storage',
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
      // Persistir todo excepto estados de carga
      partialize: (state) =>
        ({
          sharedBudgets: state.sharedBudgets,
          invitations: state.invitations,
          activities: state.activities,
          sharedExpenses: state.sharedExpenses,
          isLoading: false,
          isSyncing: false,
          createSharedBudget: state.createSharedBudget,
          updateSharedBudget: state.updateSharedBudget,
          deleteSharedBudget: state.deleteSharedBudget,
          inviteUserToBudget: state.inviteUserToBudget,
          acceptInvitation: state.acceptInvitation,
          declineInvitation: state.declineInvitation,
          removeUserFromBudget: state.removeUserFromBudget,
          updateUserRole: state.updateUserRole,
          addSharedExpense: state.addSharedExpense,
          updateSharedExpense: state.updateSharedExpense,
          deleteSharedExpense: state.deleteSharedExpense,
          approveExpense: state.approveExpense,
          rejectExpense: state.rejectExpense,
          getBudget: state.getBudget,
          getBudgetsForUser: state.getBudgetsForUser,
          getBudgetExpenses: state.getBudgetExpenses,
          getUserSpentAmount: state.getUserSpentAmount,
          getBudgetActivity: state.getBudgetActivity,
          getPendingInvitations: state.getPendingInvitations,
          calculateBudgetUsage: state.calculateBudgetUsage,
          addActivity: state.addActivity,
          syncWithServer: state.syncWithServer,
          resetStore: state.resetStore
        } as SharedBudgetState)
    }
  )
)

// Hooks personalizados
export const useSharedBudgetActions = () => {
  const store = useSharedBudgetStore()
  return {
    createBudget: store.createSharedBudget,
    updateBudget: store.updateSharedBudget,
    deleteBudget: store.deleteSharedBudget,
    inviteUser: store.inviteUserToBudget,
    removeUser: store.removeUserFromBudget,
    updateUserRole: store.updateUserRole,
    addExpense: store.addSharedExpense,
    updateExpense: store.updateSharedExpense,
    deleteExpense: store.deleteSharedExpense,
    approveExpense: store.approveExpense,
    rejectExpense: store.rejectExpense
  }
}

export const useSharedBudgetData = () => {
  const store = useSharedBudgetStore()
  const currentUser = useUserStore((state) => state.currentUser)

  return {
    budgets: currentUser ? store.getBudgetsForUser(currentUser.id) : [],
    invitations: store.getPendingInvitations(),
    activities: store.activities,
    expenses: store.sharedExpenses,
    isLoading: store.isLoading,
    isSyncing: store.isSyncing,
    getBudget: store.getBudget,
    getBudgetExpenses: store.getBudgetExpenses,
    calculateUsage: store.calculateBudgetUsage
  }
}

export const useInvitations = () => {
  const store = useSharedBudgetStore()
  return {
    pendingInvitations: store.getPendingInvitations(),
    acceptInvitation: store.acceptInvitation,
    declineInvitation: store.declineInvitation
  }
}
