import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AutoReport,
  FamilyGroup,
  OptimizationRecommendation,
  SavingsGoal,
  SharedExpense
} from '../types/advanced'

interface AdvancedStore {
  // Metas de ahorro
  savingsGoals: SavingsGoal[]

  // Gastos compartidos
  sharedExpenses: SharedExpense[]
  familyGroup: FamilyGroup | null

  // Reportes automáticos
  autoReports: AutoReport[]

  // Recomendaciones
  recommendations: OptimizationRecommendation[]

  // Estado
  isLoading: boolean

  // Acciones - Metas de Ahorro
  createSavingsGoal: (
    goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void
  deleteSavingsGoal: (id: string) => void
  addToSavingsGoal: (goalId: string, amount: number) => void
  checkMilestones: (goalId: string) => void

  // Acciones - Gastos Compartidos
  createSharedExpense: (
    expense: Omit<SharedExpense, 'id' | 'createdAt'>
  ) => void
  updateSharedExpense: (id: string, updates: Partial<SharedExpense>) => void
  markParticipantAsPaid: (expenseId: string, userId: string) => void
  calculateSplitAmounts: (
    totalAmount: number,
    splitMethod: SharedExpense['splitMethod'],
    participants: SharedExpense['participants']
  ) => SharedExpense['participants']

  // Acciones - Familia/Grupo
  createFamilyGroup: (group: Omit<FamilyGroup, 'id' | 'createdAt'>) => void
  updateFamilyGroup: (updates: Partial<FamilyGroup>) => void
  addFamilyMember: (member: Omit<FamilyGroup['members'][0], 'joinedAt'>) => void
  removeFamilyMember: (userId: string) => void

  // Acciones - Reportes Automáticos
  createAutoReport: (report: Omit<AutoReport, 'id' | 'createdAt'>) => void
  updateAutoReport: (id: string, updates: Partial<AutoReport>) => void
  deleteAutoReport: (id: string) => void
  toggleAutoReport: (id: string) => void

  // Acciones - Recomendaciones
  addRecommendation: (
    recommendation: Omit<OptimizationRecommendation, 'id' | 'generatedAt'>
  ) => void
  implementRecommendation: (id: string) => void
  dismissRecommendation: (id: string) => void

  // Utilidades
  resetStore: () => void
}

export const useAdvancedStore = create<AdvancedStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      savingsGoals: [],
      sharedExpenses: [],
      familyGroup: null,
      autoReports: [],
      recommendations: [],
      isLoading: false,

      // === METAS DE AHORRO ===

      createSavingsGoal: (goalData) => {
        const newGoal: SavingsGoal = {
          ...goalData,
          id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set((state) => ({
          savingsGoals: [...state.savingsGoals, newGoal]
        }))
      },

      updateSavingsGoal: (id, updates) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) =>
            goal.id === id
              ? { ...goal, ...updates, updatedAt: new Date() }
              : goal
          )
        }))
      },

      deleteSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((goal) => goal.id !== id)
        }))
      },

      addToSavingsGoal: (goalId, amount) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  currentAmount: goal.currentAmount + amount,
                  updatedAt: new Date()
                }
              : goal
          )
        }))

        // Verificar hitos después de agregar
        get().checkMilestones(goalId)
      },

      checkMilestones: (goalId) => {
        const goal = get().savingsGoals.find((g) => g.id === goalId)
        if (!goal) return

        const progressPercentage =
          (goal.currentAmount / goal.targetAmount) * 100

        const updatedMilestones = goal.milestones.map((milestone) => {
          if (
            !milestone.achieved &&
            progressPercentage >= milestone.percentage
          ) {
            return {
              ...milestone,
              achieved: true,
              achievedDate: new Date()
            }
          }
          return milestone
        })

        get().updateSavingsGoal(goalId, { milestones: updatedMilestones })
      },

      // === GASTOS COMPARTIDOS ===

      createSharedExpense: (expenseData) => {
        const newExpense: SharedExpense = {
          ...expenseData,
          id: `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date()
        }

        set((state) => ({
          sharedExpenses: [...state.sharedExpenses, newExpense]
        }))
      },

      updateSharedExpense: (id, updates) => {
        set((state) => ({
          sharedExpenses: state.sharedExpenses.map((expense) =>
            expense.id === id ? { ...expense, ...updates } : expense
          )
        }))
      },

      markParticipantAsPaid: (expenseId, userId) => {
        set((state) => ({
          sharedExpenses: state.sharedExpenses.map((expense) => {
            if (expense.id === expenseId) {
              const updatedParticipants = expense.participants.map(
                (participant) =>
                  participant.userId === userId
                    ? { ...participant, paid: true, paidDate: new Date() }
                    : participant
              )

              const allPaid = updatedParticipants.every((p) => p.paid)
              const somePaid = updatedParticipants.some((p) => p.paid)

              let newStatus: SharedExpense['status'] = 'pending'
              if (allPaid) newStatus = 'completed'
              else if (somePaid) newStatus = 'partially_paid'

              return {
                ...expense,
                participants: updatedParticipants,
                status: newStatus
              }
            }
            return expense
          })
        }))
      },

      calculateSplitAmounts: (totalAmount, splitMethod, participants) => {
        switch (splitMethod) {
          case 'even':
            const evenAmount = totalAmount / participants.length
            return participants.map((p) => ({ ...p, amount: evenAmount }))

          case 'by_percentage':
            return participants.map((p) => ({
              ...p,
              amount: totalAmount * (p.amount / 100)
            }))

          case 'by_amount':
            // Los montos ya están definidos en participants
            return participants

          default:
            return participants
        }
      },

      // === FAMILIA/GRUPO ===

      createFamilyGroup: (groupData) => {
        const newGroup: FamilyGroup = {
          ...groupData,
          id: `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date()
        }

        set({ familyGroup: newGroup })
      },

      updateFamilyGroup: (updates) => {
        set((state) => ({
          familyGroup: state.familyGroup
            ? { ...state.familyGroup, ...updates }
            : null
        }))
      },

      addFamilyMember: (memberData) => {
        const newMember = {
          ...memberData,
          joinedAt: new Date()
        }

        set((state) => ({
          familyGroup: state.familyGroup
            ? {
                ...state.familyGroup,
                members: [...state.familyGroup.members, newMember]
              }
            : null
        }))
      },

      removeFamilyMember: (userId) => {
        set((state) => ({
          familyGroup: state.familyGroup
            ? {
                ...state.familyGroup,
                members: state.familyGroup.members.filter(
                  (member) => member.userId !== userId
                )
              }
            : null
        }))
      },

      // === REPORTES AUTOMÁTICOS ===

      createAutoReport: (reportData) => {
        const newReport: AutoReport = {
          ...reportData,
          id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date()
        }

        set((state) => ({
          autoReports: [...state.autoReports, newReport]
        }))
      },

      updateAutoReport: (id, updates) => {
        set((state) => ({
          autoReports: state.autoReports.map((report) =>
            report.id === id ? { ...report, ...updates } : report
          )
        }))
      },

      deleteAutoReport: (id) => {
        set((state) => ({
          autoReports: state.autoReports.filter((report) => report.id !== id)
        }))
      },

      toggleAutoReport: (id) => {
        set((state) => ({
          autoReports: state.autoReports.map((report) =>
            report.id === id
              ? { ...report, isActive: !report.isActive }
              : report
          )
        }))
      },

      // === RECOMENDACIONES ===

      addRecommendation: (recData) => {
        const newRecommendation: OptimizationRecommendation = {
          ...recData,
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          generatedAt: new Date()
        }

        set((state) => ({
          recommendations: [...state.recommendations, newRecommendation]
        }))
      },

      implementRecommendation: (id) => {
        set((state) => ({
          recommendations: state.recommendations.map((rec) =>
            rec.id === id
              ? { ...rec, isImplemented: true, implementedAt: new Date() }
              : rec
          )
        }))
      },

      dismissRecommendation: (id) => {
        set((state) => ({
          recommendations: state.recommendations.filter((rec) => rec.id !== id)
        }))
      },

      // === UTILIDADES ===

      resetStore: () => {
        set({
          savingsGoals: [],
          sharedExpenses: [],
          familyGroup: null,
          autoReports: [],
          recommendations: [],
          isLoading: false
        })
      }
    }),
    {
      name: 'advanced-store',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name)
        }
      },
      // Excluir datos temporales de la persistencia
      partialize: (state) => ({
        savingsGoals: state.savingsGoals,
        familyGroup: state.familyGroup,
        autoReports: state.autoReports
      })
    }
  )
)

// Hooks especializados para cada funcionalidad
export const useSavingsGoals = () => {
  const store = useAdvancedStore()
  return {
    goals: store.savingsGoals,
    createGoal: store.createSavingsGoal,
    updateGoal: store.updateSavingsGoal,
    deleteGoal: store.deleteSavingsGoal,
    addToGoal: store.addToSavingsGoal,
    checkMilestones: store.checkMilestones
  }
}

export const useSharedExpenses = () => {
  const store = useAdvancedStore()
  return {
    sharedExpenses: store.sharedExpenses,
    createSharedExpense: store.createSharedExpense,
    updateSharedExpense: store.updateSharedExpense,
    markAsPaid: store.markParticipantAsPaid,
    calculateSplit: store.calculateSplitAmounts
  }
}

export const useFamilyGroup = () => {
  const store = useAdvancedStore()
  return {
    familyGroup: store.familyGroup,
    createGroup: store.createFamilyGroup,
    updateGroup: store.updateFamilyGroup,
    addMember: store.addFamilyMember,
    removeMember: store.removeFamilyMember
  }
}

export const useAutoReports = () => {
  const store = useAdvancedStore()
  return {
    reports: store.autoReports,
    createReport: store.createAutoReport,
    updateReport: store.updateAutoReport,
    deleteReport: store.deleteAutoReport,
    toggleReport: store.toggleAutoReport
  }
}

export const useRecommendations = () => {
  const store = useAdvancedStore()
  return {
    recommendations: store.recommendations,
    addRecommendation: store.addRecommendation,
    implementRecommendation: store.implementRecommendation,
    dismissRecommendation: store.dismissRecommendation
  }
}
