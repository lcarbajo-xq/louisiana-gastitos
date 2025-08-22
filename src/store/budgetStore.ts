import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MLAnalysisService } from '../services/MLAnalysisService'
import { BudgetAlert, SmartBudget, SpendingPrediction } from '../types/advanced'

interface BudgetStore {
  // Estado
  budgets: SmartBudget[]
  alerts: BudgetAlert[]
  predictions: SpendingPrediction[]
  isLoading: boolean

  // Acciones de presupuestos
  createBudget: (
    budget: Omit<SmartBudget, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  updateBudget: (id: string, updates: Partial<SmartBudget>) => void
  deleteBudget: (id: string) => void
  getBudget: (id: string) => SmartBudget | undefined
  getBudgetsByCategory: (categoryId: string) => SmartBudget[]

  // Acciones de alertas
  createAlert: (alert: Omit<BudgetAlert, 'id' | 'date' | 'isRead'>) => void
  markAlertAsRead: (alertId: string) => void
  dismissAlert: (alertId: string) => void
  getUnreadAlerts: () => BudgetAlert[]
  checkBudgetLimits: (categoryId: string, currentSpent: number) => void

  // Predicciones ML
  generatePredictions: (expenses: any[]) => Promise<void>
  updatePrediction: (categoryId: string, prediction: SpendingPrediction) => void

  // Presupuestos inteligentes
  enableSmartAdjustment: (budgetId: string) => void
  adjustBudgetAutomatically: (budgetId: string, historicalData: any[]) => void

  // Utilidades
  clearAlerts: () => void
  resetStore: () => void
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      budgets: [],
      alerts: [],
      predictions: [],
      isLoading: false,

      // Crear presupuesto
      createBudget: (budgetData) => {
        const newBudget: SmartBudget = {
          ...budgetData,
          id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set((state) => ({
          budgets: [...state.budgets, newBudget]
        }))
      },

      // Actualizar presupuesto
      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id
              ? { ...budget, ...updates, updatedAt: new Date() }
              : budget
          )
        }))
      },

      // Eliminar presupuesto
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
          alerts: state.alerts.filter((alert) => alert.budgetId !== id)
        }))
      },

      // Obtener presupuesto por ID
      getBudget: (id) => {
        return get().budgets.find((budget) => budget.id === id)
      },

      // Obtener presupuestos por categoría
      getBudgetsByCategory: (categoryId) => {
        return get().budgets.filter(
          (budget) => budget.categoryId === categoryId
        )
      },

      // Crear alerta
      createAlert: (alertData) => {
        const newAlert: BudgetAlert = {
          ...alertData,
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date(),
          isRead: false
        }

        set((state) => ({
          alerts: [...state.alerts, newAlert]
        }))
      },

      // Marcar alerta como leída
      markAlertAsRead: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
          )
        }))
      },

      // Descartar alerta
      dismissAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== alertId)
        }))
      },

      // Obtener alertas no leídas
      getUnreadAlerts: () => {
        return get().alerts.filter((alert) => !alert.isRead)
      },

      // Verificar límites de presupuesto
      checkBudgetLimits: (categoryId, currentSpent) => {
        const budget = get().budgets.find((b) => b.categoryId === categoryId)
        if (!budget) return

        const percentage = (currentSpent / budget.amount) * 100

        if (
          percentage >= 100 &&
          !get().alerts.some(
            (a) => a.budgetId === budget.id && a.type === 'exceeded'
          )
        ) {
          get().createAlert({
            budgetId: budget.id,
            type: 'exceeded',
            message: `Has excedido el presupuesto de ${
              budget.categoryId
            } por $${(currentSpent - budget.amount).toFixed(2)}`,
            amount: currentSpent,
            percentage: Math.round(percentage),
            actionRequired: true
          })
        } else if (
          percentage >= budget.alertThresholds.danger &&
          !get().alerts.some(
            (a) => a.budgetId === budget.id && a.type === 'danger'
          )
        ) {
          get().createAlert({
            budgetId: budget.id,
            type: 'danger',
            message: `Estás cerca del límite de ${
              budget.categoryId
            } (${Math.round(percentage)}% usado)`,
            amount: currentSpent,
            percentage: Math.round(percentage),
            actionRequired: true
          })
        } else if (
          percentage >= budget.alertThresholds.warning &&
          !get().alerts.some(
            (a) => a.budgetId === budget.id && a.type === 'warning'
          )
        ) {
          get().createAlert({
            budgetId: budget.id,
            type: 'warning',
            message: `Has alcanzado el ${Math.round(
              percentage
            )}% de tu presupuesto de ${budget.categoryId}`,
            amount: currentSpent,
            percentage: Math.round(percentage),
            actionRequired: false
          })
        }
      },

      // Generar predicciones ML
      generatePredictions: async (expenses) => {
        set({ isLoading: true })

        try {
          const { budgets } = get()
          const predictions: SpendingPrediction[] = []

          for (const budget of budgets) {
            const weeklyPrediction = await MLAnalysisService.predictSpending(
              expenses,
              budget.categoryId,
              'week'
            )
            const monthlyPrediction = await MLAnalysisService.predictSpending(
              expenses,
              budget.categoryId,
              'month'
            )

            predictions.push(weeklyPrediction, monthlyPrediction)
          }

          set({
            predictions,
            isLoading: false
          })
        } catch (error) {
          console.error('Error generating predictions:', error)
          set({ isLoading: false })
        }
      },

      // Actualizar predicción específica
      updatePrediction: (categoryId, prediction) => {
        set((state) => ({
          predictions: [
            ...state.predictions.filter(
              (p) =>
                !(p.categoryId === categoryId && p.period === prediction.period)
            ),
            prediction
          ]
        }))
      },

      // Habilitar ajuste inteligente
      enableSmartAdjustment: (budgetId) => {
        get().updateBudget(budgetId, { smartAdjustment: true })
      },

      // Ajustar presupuesto automáticamente
      adjustBudgetAutomatically: (budgetId, historicalData) => {
        const budget = get().getBudget(budgetId)
        if (!budget || !budget.smartAdjustment) return

        // Calcular nuevo monto basado en datos históricos
        const totalSpent = historicalData.reduce(
          (sum: number, expense: any) =>
            expense.category.id === budget.categoryId
              ? sum + expense.amount
              : sum,
          0
        )
        const averageSpent =
          totalSpent / Math.max(1, historicalData.length / 30) // Por mes

        // Ajustar con un margen de seguridad del 10%
        const suggestedAmount = Math.round(averageSpent * 1.1)

        if (Math.abs(suggestedAmount - budget.amount) > budget.amount * 0.2) {
          get().updateBudget(budgetId, {
            amount: suggestedAmount,
            historicalAverage: averageSpent
          })

          // Crear alerta informativa
          get().createAlert({
            budgetId,
            type: 'prediction',
            message: `Presupuesto de ${budget.categoryId} ajustado automáticamente a $${suggestedAmount} basado en tus patrones de gasto`,
            amount: suggestedAmount,
            percentage: 0,
            actionRequired: false
          })
        }
      },

      // Limpiar alertas
      clearAlerts: () => {
        set({ alerts: [] })
      },

      // Reset completo del store
      resetStore: () => {
        set({
          budgets: [],
          alerts: [],
          predictions: [],
          isLoading: false
        })
      }
    }),
    {
      name: 'budget-store',
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
      // No persistir datos sensibles como alertas y predicciones
      partialize: (state) => ({
        budgets: state.budgets
      })
    }
  )
)

// Hooks personalizados para facilitar el uso
export const useBudgetActions = () => {
  const store = useBudgetStore()
  return {
    createBudget: store.createBudget,
    updateBudget: store.updateBudget,
    deleteBudget: store.deleteBudget,
    generatePredictions: store.generatePredictions,
    enableSmartAdjustment: store.enableSmartAdjustment,
    checkBudgetLimits: store.checkBudgetLimits
  }
}

export const useBudgetAlerts = () => {
  const store = useBudgetStore()
  return {
    alerts: store.alerts,
    unreadAlerts: store.getUnreadAlerts(),
    markAsRead: store.markAlertAsRead,
    dismissAlert: store.dismissAlert,
    clearAll: store.clearAlerts
  }
}

export const useBudgetPredictions = () => {
  const store = useBudgetStore()
  return {
    predictions: store.predictions,
    isLoading: store.isLoading,
    generatePredictions: store.generatePredictions
  }
}
