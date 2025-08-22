import { useCallback } from 'react'
import { ExportService } from '../services/ExportService'
import { MLAnalysisService } from '../services/MLAnalysisService'
import { ReportService } from '../services/ReportService'
import {
  useAdvancedStore,
  useAutoReports,
  useFamilyGroup,
  useRecommendations,
  useSavingsGoals,
  useSharedExpenses
} from '../store/advancedStore'
import {
  useBudgetActions,
  useBudgetAlerts,
  useBudgetPredictions,
  useBudgetStore
} from '../store/budgetStore'
import { useExpenseStore } from '../store/expenseStore'
import { DemographicComparison, SpendingPattern } from '../types/advanced'

/**
 * Hook principal para funcionalidades avanzadas del expense tracker
 */
export const useAdvancedFeatures = () => {
  // Stores
  const budgetStore = useBudgetStore()
  const advancedStore = useAdvancedStore()
  const expenseStore = useExpenseStore()

  // Hooks especializados
  const budgetActions = useBudgetActions()
  const budgetAlerts = useBudgetAlerts()
  const budgetPredictions = useBudgetPredictions()
  const savingsGoals = useSavingsGoals()
  const sharedExpenses = useSharedExpenses()
  const familyGroup = useFamilyGroup()
  const autoReports = useAutoReports()
  const recommendations = useRecommendations()

  // === ANÁLISIS INTELIGENTE ===

  const analyzeSpendingPatterns = useCallback(async (): Promise<
    SpendingPattern[]
  > => {
    try {
      const expenses = expenseStore.expenses
      return MLAnalysisService.analyzeSpendingPatterns(expenses)
    } catch (error) {
      console.error('Error analyzing spending patterns:', error)
      return []
    }
  }, [expenseStore.expenses])

  const generateSmartRecommendations = useCallback(async () => {
    try {
      const expenses = expenseStore.expenses
      const budgets = budgetStore.budgets
      const predictions = budgetStore.predictions

      const newRecommendations = MLAnalysisService.generateRecommendations(
        expenses,
        budgets,
        predictions
      )

      newRecommendations.forEach((rec) => {
        recommendations.addRecommendation(rec)
      })

      return newRecommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }, [
    expenseStore.expenses,
    budgetStore.budgets,
    budgetStore.predictions,
    recommendations
  ])

  const detectUnusualSpending = useCallback(
    (categoryId?: string) => {
      const expenses = expenseStore.expenses
      const recentExpenses = expenses.filter((expense) => {
        const daysAgo =
          (Date.now() - expense.date.getTime()) / (1000 * 60 * 60 * 24)
        return (
          daysAgo <= 30 && (!categoryId || expense.category.id === categoryId)
        )
      })

      if (recentExpenses.length < 5) return []

      const amounts = recentExpenses.map((exp) => exp.amount)
      const mean =
        amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
      const stdDev = Math.sqrt(
        amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) /
          amounts.length
      )

      // Detectar gastos que están más de 2 desviaciones estándar por encima de la media
      const unusualExpenses = recentExpenses.filter(
        (expense) => expense.amount > mean + 2 * stdDev
      )

      return unusualExpenses
    },
    [expenseStore.expenses]
  )

  // === PRESUPUESTOS INTELIGENTES ===

  const setupSmartBudget = useCallback(
    async (categoryId: string, enableAutoAdjust = true) => {
      const expenses = expenseStore.expenses
      const categoryExpenses = expenses.filter(
        (exp) => exp.category.id === categoryId
      )

      if (categoryExpenses.length < 3) {
        throw new Error(
          'Necesitas al menos 3 gastos en esta categoría para crear un presupuesto inteligente'
        )
      }

      // Calcular promedio histórico de los últimos 90 días
      const recentExpenses = categoryExpenses.filter((exp) => {
        const daysAgo =
          (Date.now() - exp.date.getTime()) / (1000 * 60 * 60 * 24)
        return daysAgo <= 90
      })

      const monthlyAverage =
        recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 3

      budgetActions.createBudget({
        categoryId,
        amount: Math.round(monthlyAverage * 1.1), // 10% de margen
        period: 'monthly',
        alertThresholds: {
          warning: 80,
          danger: 95
        },
        smartAdjustment: enableAutoAdjust,
        historicalAverage: monthlyAverage
      })

      // Generar predicciones iniciales
      await budgetActions.generatePredictions(expenses)
    },
    [expenseStore.expenses, budgetActions]
  )

  const optimizeBudgets = useCallback(async () => {
    const expenses = expenseStore.expenses
    const budgets = budgetStore.budgets

    for (const budget of budgets) {
      if (budget.smartAdjustment) {
        budgetStore.adjustBudgetAutomatically(budget.id, expenses)
      }
    }
  }, [expenseStore.expenses, budgetStore])

  // === REPORTES Y EXPORTACIÓN ===

  const generateCustomReport = useCallback(
    async (
      reportType: 'summary' | 'detailed' | 'categories',
      period: 'weekly' | 'monthly' | 'quarterly'
    ) => {
      const mockAutoReport = {
        id: 'custom',
        name: `Reporte ${reportType} - ${period}`,
        type: period,
        recipients: [],
        template: reportType,
        includeSections: {
          overview: true,
          categoryBreakdown: true,
          budgetStatus: true,
          savings: true,
          predictions: true,
          recommendations: true
        },
        schedule: { time: '09:00' },
        isActive: false,
        createdAt: new Date()
      }

      return await ReportService.generateAutoReport(
        mockAutoReport,
        expenseStore.expenses,
        budgetStore.budgets,
        advancedStore.savingsGoals,
        budgetStore.predictions
      )
    },
    [
      expenseStore.expenses,
      budgetStore.budgets,
      budgetStore.predictions,
      advancedStore.savingsGoals
    ]
  )

  const exportData = useCallback(
    async (
      format: 'csv' | 'excel' | 'json',
      dataType: 'expenses' | 'budgets' | 'full',
      dateRange: { start: Date; end: Date }
    ) => {
      const data = {
        expenses: expenseStore.expenses,
        budgets: budgetStore.budgets,
        savings: advancedStore.savingsGoals
      }

      const exportConfig = {
        format,
        type: dataType,
        dateRange
      }

      switch (format) {
        case 'csv':
          return await ExportService.exportToCSV(data, exportConfig)
        case 'excel':
          return await ExportService.exportToExcel(data, exportConfig)
        case 'json':
          return await ExportService.exportToJSON(data, exportConfig)
        default:
          throw new Error('Formato no soportado')
      }
    },
    [expenseStore.expenses, budgetStore.budgets, advancedStore.savingsGoals]
  )

  // === ANÁLISIS DEMOGRÁFICO ===

  const compareDemographics = useCallback(
    async (userProfile: {
      age: number
      income: number
      location: string
    }): Promise<DemographicComparison> => {
      // En una implementación real, esto consultaría una base de datos demográfica
      const expenses = expenseStore.expenses
      const categoryTotals: Record<string, number> = {}

      expenses.forEach((expense) => {
        categoryTotals[expense.category.id] =
          (categoryTotals[expense.category.id] || 0) + expense.amount
      })

      // Simulación de datos demográficos
      const demographicAverages: Record<string, number> = {
        food: 800,
        transport: 300,
        health: 200,
        shopping: 500,
        education: 150,
        other: 250
      }

      const categoryAverages: Record<string, any> = {}
      Object.keys(categoryTotals).forEach((categoryId) => {
        const userAverage = categoryTotals[categoryId] / 12 // Promedio mensual
        const demographicAverage = demographicAverages[categoryId] || 200
        const percentile = userAverage <= demographicAverage ? 50 : 75 // Simplificado

        categoryAverages[categoryId] = {
          userAverage,
          demographicAverage,
          percentile
        }
      })

      return {
        userId: 'current-user',
        ageGroup: `${Math.floor(userProfile.age / 10) * 10}s`,
        incomeRange: userProfile.income > 50000 ? 'high' : 'medium',
        location: userProfile.location,
        categoryAverages,
        overallScore: 65, // Calculado basado en el análisis
        lastUpdated: new Date()
      }
    },
    [expenseStore.expenses]
  )

  // === UTILIDADES DE ESTADO ===

  const getOverallFinancialHealth = useCallback(() => {
    const budgets = budgetStore.budgets
    const goals = advancedStore.savingsGoals
    const expenses = expenseStore.expenses

    // Calcular salud presupuestaria
    const budgetHealth =
      budgets.length > 0
        ? budgets.reduce((sum, budget) => {
            const categoryExpenses = expenses.filter(
              (exp) => exp.category.id === budget.categoryId
            )
            const spent = categoryExpenses.reduce(
              (sum, exp) => sum + exp.amount,
              0
            )
            const usage = spent / budget.amount
            return sum + Math.min(1, 1 - Math.max(0, usage - 1)) // Penalizar sobregasto
          }, 0) / budgets.length
        : 0.5

    // Calcular progreso de metas
    const savingsHealth =
      goals.length > 0
        ? goals.reduce((sum, goal) => {
            const progress = goal.currentAmount / goal.targetAmount
            return sum + Math.min(1, progress)
          }, 0) / goals.length
        : 0.5

    // Calcular consistencia de gastos (menor variabilidad = mejor salud)
    const monthlyTotals = expenses.reduce((acc, expense) => {
      const monthKey = `${expense.date.getFullYear()}-${expense.date.getMonth()}`
      acc[monthKey] = (acc[monthKey] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const amounts = Object.values(monthlyTotals)
    const avgMonthly =
      amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const variability =
      amounts.length > 1
        ? Math.sqrt(
            amounts.reduce(
              (sum, amount) => sum + Math.pow(amount - avgMonthly, 2),
              0
            ) / amounts.length
          ) / avgMonthly
        : 0

    const consistencyHealth = Math.max(0, 1 - variability)

    // Calcular score general (0-100)
    const overallScore = Math.round(
      (budgetHealth * 0.4 + savingsHealth * 0.35 + consistencyHealth * 0.25) *
        100
    )

    return {
      score: overallScore,
      budgetHealth: Math.round(budgetHealth * 100),
      savingsHealth: Math.round(savingsHealth * 100),
      consistencyHealth: Math.round(consistencyHealth * 100),
      status:
        overallScore >= 80
          ? 'excellent'
          : overallScore >= 60
          ? 'good'
          : overallScore >= 40
          ? 'fair'
          : 'poor'
    }
  }, [budgetStore.budgets, advancedStore.savingsGoals, expenseStore.expenses])

  return {
    // Análisis inteligente
    analyzeSpendingPatterns,
    generateSmartRecommendations,
    detectUnusualSpending,
    compareDemographics,

    // Presupuestos inteligentes
    setupSmartBudget,
    optimizeBudgets,
    budgetActions,
    budgetAlerts,
    budgetPredictions,

    // Metas de ahorro
    savingsGoals,

    // Gastos compartidos
    sharedExpenses,
    familyGroup,

    // Reportes y exportación
    generateCustomReport,
    exportData,
    autoReports,

    // Recomendaciones
    recommendations,

    // Estado general
    getOverallFinancialHealth,

    // Datos de estado
    isLoading: budgetStore.isLoading || advancedStore.isLoading
  }
}

// Hook simplificado para features básicas
export const useSmartBudgeting = () => {
  const {
    setupSmartBudget,
    optimizeBudgets,
    budgetActions,
    budgetAlerts,
    budgetPredictions
  } = useAdvancedFeatures()

  return {
    setupSmartBudget,
    optimizeBudgets,
    ...budgetActions,
    ...budgetAlerts,
    ...budgetPredictions
  }
}

// Hook para análisis y recomendaciones
export const useFinancialInsights = () => {
  const {
    analyzeSpendingPatterns,
    generateSmartRecommendations,
    detectUnusualSpending,
    compareDemographics,
    getOverallFinancialHealth
  } = useAdvancedFeatures()

  return {
    analyzeSpendingPatterns,
    generateSmartRecommendations,
    detectUnusualSpending,
    compareDemographics,
    getOverallFinancialHealth
  }
}
