import {
  OptimizationRecommendation,
  SpendingPattern,
  SpendingPrediction
} from '../types/advanced'
import { Expense } from '../types/expense'

export interface AnomalyDetectionResult {
  isAnomaly: boolean
  score: number
  reason?: string
  threshold: number
}

export class MLAnalysisService {
  private static instance: MLAnalysisService
  private readonly ANOMALY_THRESHOLD = 2.5 // Z-score threshold

  public static getInstance(): MLAnalysisService {
    if (!MLAnalysisService.instance) {
      MLAnalysisService.instance = new MLAnalysisService()
    }
    return MLAnalysisService.instance
  }

  /**
   * Detecta anomalías en los gastos basándose en patrones históricos
   */
  public detectAnomalies(expenses: Expense[]): AnomalyDetectionResult[] {
    if (expenses.length < 3) {
      return []
    }

    const results: AnomalyDetectionResult[] = []

    // Group expenses by category
    const categoryGroups = this.groupExpensesByCategory(expenses)

    for (const [, categoryExpenses] of categoryGroups.entries()) {
      if (categoryExpenses.length < 2) continue

      const amounts = categoryExpenses.map((e) => e.amount)
      const mean = this.calculateMean(amounts)
      const stdDev = this.calculateStandardDeviation(amounts, mean)

      if (stdDev === 0) continue

      categoryExpenses.forEach((expense) => {
        const zScore = Math.abs((expense.amount - mean) / stdDev)
        const isAnomaly = zScore > this.ANOMALY_THRESHOLD

        if (isAnomaly) {
          results.push({
            isAnomaly: true,
            score: zScore,
            reason: `Gasto de $${expense.amount} en ${
              expense.category.name
            } es ${zScore.toFixed(
              2
            )} desviaciones estándar por encima del promedio ($${mean.toFixed(
              2
            )})`,
            threshold: this.ANOMALY_THRESHOLD
          })
        }
      })
    }

    return results
  }

  private groupExpensesByCategory(expenses: Expense[]): Map<string, Expense[]> {
    const groups = new Map<string, Expense[]>()

    expenses.forEach((expense) => {
      const category = expense.category.name
      if (!groups.has(category)) {
        groups.set(category, [])
      }
      groups.get(category)!.push(expense)
    })

    return groups
  }

  private calculateMean(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  private calculateStandardDeviation(numbers: number[], mean: number): number {
    const variance =
      numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) /
      numbers.length
    return Math.sqrt(variance)
  }
  /**
   * Predice gastos futuros basado en patrones históricos
   */
  static async predictSpending(
    expenses: Expense[],
    categoryId: string,
    period: 'week' | 'month'
  ): Promise<SpendingPrediction> {
    const categoryExpenses = expenses.filter(
      (expense) => expense.category.id === categoryId
    )

    if (categoryExpenses.length < 3) {
      return {
        categoryId,
        predictedAmount: 0,
        confidence: 0,
        period,
        basedOnDays: 0,
        factors: { historical: 0, seasonal: 0, trending: 0 },
        generatedAt: new Date()
      }
    }

    const now = new Date()
    const daysToPredict = period === 'week' ? 7 : 30
    const historicalDays = Math.min(90, categoryExpenses.length * 2) // Máximo 90 días

    // Análisis histórico
    const recentExpenses = categoryExpenses
      .filter((expense) => {
        const daysDiff =
          (now.getTime() - expense.date.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= historicalDays
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    const historicalAverage = this.calculateHistoricalAverage(
      recentExpenses,
      daysToPredict
    )
    const seasonalFactor = this.calculateSeasonalFactor(recentExpenses, now)
    const trendFactor = this.calculateTrendFactor(recentExpenses)

    // Predicción combinada
    const predictedAmount = Math.max(
      0,
      historicalAverage * 0.5 +
        historicalAverage * seasonalFactor * 0.3 +
        historicalAverage * trendFactor * 0.2
    )

    // Calcular confianza basada en consistencia de datos
    const confidence = this.calculateConfidence(
      recentExpenses,
      historicalAverage
    )

    return {
      categoryId,
      predictedAmount: Math.round(predictedAmount * 100) / 100,
      confidence,
      period,
      basedOnDays: historicalDays,
      factors: {
        historical: historicalAverage,
        seasonal: seasonalFactor,
        trending: trendFactor
      },
      generatedAt: now
    }
  }

  /**
   * Analiza patrones de gasto por ubicación, tiempo, etc.
   */
  static analyzeSpendingPatterns(expenses: Expense[]): SpendingPattern[] {
    const patterns: SpendingPattern[] = []
    const now = new Date()
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Patrón por día de la semana
    const dayOfWeekPattern = this.analyzeDayOfWeekPattern(
      expenses,
      lastMonth,
      now
    )
    if (dayOfWeekPattern) patterns.push(dayOfWeekPattern)

    // Patrón por hora del día
    const timePattern = this.analyzeTimePattern(expenses, lastMonth, now)
    if (timePattern) patterns.push(timePattern)

    // Patrón por ubicación (si está disponible)
    const locationPattern = this.analyzeLocationPattern(
      expenses,
      lastMonth,
      now
    )
    if (locationPattern) patterns.push(locationPattern)

    return patterns
  }

  /**
   * Genera recomendaciones de optimización
   */
  static generateRecommendations(
    expenses: Expense[],
    budgets: any[], // SmartBudget[]
    predictions: SpendingPrediction[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = []
    const now = new Date()

    // Análisis de categorías con sobregasto
    const overspentCategories = this.findOverspentCategories(expenses, budgets)
    overspentCategories.forEach((category) => {
      recommendations.push({
        id: `budget-increase-${category.id}`,
        type: 'budget_increase',
        title: `Considerar aumentar presupuesto de ${category.name}`,
        description: `Has excedido el presupuesto de ${category.name} en los últimos 2 meses. Considera ajustar el límite.`,
        category: category.id,
        impact: 'medium',
        actionRequired: 'Revisar y ajustar presupuesto mensual',
        isImplemented: false,
        generatedAt: now
      })
    })

    // Oportunidades de ahorro
    const savingsOpportunities = this.findSavingsOpportunities(
      expenses,
      predictions
    )
    savingsOpportunities.forEach((opportunity) => {
      recommendations.push({
        id: `savings-${opportunity.categoryId}`,
        type: 'savings_opportunity',
        title: `Oportunidad de ahorro en ${opportunity.categoryName}`,
        description: opportunity.description,
        category: opportunity.categoryId,
        impact: opportunity.impact,
        potentialSavings: opportunity.amount,
        actionRequired: opportunity.action,
        isImplemented: false,
        generatedAt: now
      })
    })

    return recommendations
  }

  // Métodos privados de cálculo

  private static calculateHistoricalAverage(
    expenses: Expense[],
    targetDays: number
  ): number {
    if (expenses.length === 0) return 0

    const totalAmount = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    )
    const oldestDate = expenses[expenses.length - 1].date
    const daysCovered = Math.max(
      1,
      (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return (totalAmount / daysCovered) * targetDays
  }

  private static calculateSeasonalFactor(
    expenses: Expense[],
    currentDate: Date
  ): number {
    const currentMonth = currentDate.getMonth()

    // Agrupar gastos por mes
    const monthlyAverages = new Array(12).fill(0)
    const monthlyCounts = new Array(12).fill(0)

    expenses.forEach((expense) => {
      const month = expense.date.getMonth()
      monthlyAverages[month] += expense.amount
      monthlyCounts[month]++
    })

    // Calcular promedios reales
    for (let i = 0; i < 12; i++) {
      if (monthlyCounts[i] > 0) {
        monthlyAverages[i] /= monthlyCounts[i]
      }
    }

    const totalAverage = monthlyAverages.reduce((sum, avg) => sum + avg, 0) / 12
    const currentMonthAverage = monthlyAverages[currentMonth]

    if (totalAverage === 0) return 1
    return Math.max(0.5, Math.min(2, currentMonthAverage / totalAverage))
  }

  private static calculateTrendFactor(expenses: Expense[]): number {
    if (expenses.length < 6) return 1

    // Dividir en dos períodos: reciente y anterior
    const midPoint = Math.floor(expenses.length / 2)
    const recentExpenses = expenses.slice(0, midPoint)
    const olderExpenses = expenses.slice(midPoint)

    const recentAverage =
      recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) /
      recentExpenses.length
    const olderAverage =
      olderExpenses.reduce((sum, exp) => sum + exp.amount, 0) /
      olderExpenses.length

    if (olderAverage === 0) return 1

    const trendRatio = recentAverage / olderAverage
    return Math.max(0.5, Math.min(2, trendRatio))
  }

  private static calculateConfidence(
    expenses: Expense[],
    predictedAverage: number
  ): number {
    if (expenses.length < 3) return 0.1

    // Calcular variabilidad de los gastos
    const amounts = expenses.map((exp) => exp.amount)
    const mean =
      amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const variance =
      amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) /
      amounts.length
    const standardDeviation = Math.sqrt(variance)

    // Confianza inversa a la variabilidad
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1
    const baseConfidence = Math.max(0.1, 1 - coefficientOfVariation)

    // Ajustar por cantidad de datos
    const dataConfidence = Math.min(1, expenses.length / 10)

    return Math.min(1, baseConfidence * dataConfidence)
  }

  private static analyzeDayOfWeekPattern(
    expenses: Expense[],
    startDate: Date,
    endDate: Date
  ): SpendingPattern | null {
    const relevantExpenses = expenses.filter(
      (exp) => exp.date >= startDate && exp.date <= endDate
    )

    if (relevantExpenses.length < 5) return null

    const dayTotals = new Array(7).fill(0)
    const dayCounts = new Array(7).fill(0)

    relevantExpenses.forEach((expense) => {
      const dayOfWeek = expense.date.getDay()
      dayTotals[dayOfWeek] += expense.amount
      dayCounts[dayOfWeek]++
    })

    // Encontrar el día con más actividad
    const maxDayIndex = dayTotals.indexOf(Math.max(...dayTotals))
    const maxDayAmount = dayTotals[maxDayIndex]
    const maxDayCount = dayCounts[maxDayIndex]

    if (maxDayCount < 2) return null

    const dayNames = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado'
    ]

    return {
      id: `day-pattern-${Date.now()}`,
      type: 'day_of_week',
      pattern: `Más gastos los ${dayNames[maxDayIndex]}`,
      frequency: maxDayCount,
      averageAmount: maxDayAmount / maxDayCount,
      categoryDistribution: this.getCategoryDistribution(
        relevantExpenses.filter((exp) => exp.date.getDay() === maxDayIndex)
      ),
      timeframe: { start: startDate, end: endDate }
    }
  }

  private static analyzeTimePattern(
    expenses: Expense[],
    startDate: Date,
    endDate: Date
  ): SpendingPattern | null {
    const relevantExpenses = expenses.filter(
      (exp) => exp.date >= startDate && exp.date <= endDate
    )

    if (relevantExpenses.length < 5) return null

    // Agrupar por franjas horarias (mañana, tarde, noche)
    const timeBands = { morning: 0, afternoon: 0, evening: 0 }
    const timeCounts = { morning: 0, afternoon: 0, evening: 0 }

    relevantExpenses.forEach((expense) => {
      const hour = expense.date.getHours()
      if (hour >= 6 && hour < 12) {
        timeBands.morning += expense.amount
        timeCounts.morning++
      } else if (hour >= 12 && hour < 18) {
        timeBands.afternoon += expense.amount
        timeCounts.afternoon++
      } else {
        timeBands.evening += expense.amount
        timeCounts.evening++
      }
    })

    // Encontrar la franja con más actividad
    const maxBand = Object.entries(timeBands).reduce(
      (max, [band, amount]) => (amount > max.amount ? { band, amount } : max),
      { band: '', amount: 0 }
    )

    if (timeCounts[maxBand.band as keyof typeof timeCounts] < 2) return null

    const bandNames = {
      morning: 'mañana (6:00-12:00)',
      afternoon: 'tarde (12:00-18:00)',
      evening: 'noche (18:00-6:00)'
    }

    return {
      id: `time-pattern-${Date.now()}`,
      type: 'time',
      pattern: `Más gastos en la ${
        bandNames[maxBand.band as keyof typeof bandNames]
      }`,
      frequency: timeCounts[maxBand.band as keyof typeof timeCounts],
      averageAmount:
        maxBand.amount / timeCounts[maxBand.band as keyof typeof timeCounts],
      categoryDistribution: this.getCategoryDistribution(
        relevantExpenses.filter((expense) => {
          const hour = expense.date.getHours()
          if (maxBand.band === 'morning') return hour >= 6 && hour < 12
          if (maxBand.band === 'afternoon') return hour >= 12 && hour < 18
          return hour >= 18 || hour < 6
        })
      ),
      timeframe: { start: startDate, end: endDate }
    }
  }

  private static analyzeLocationPattern(
    expenses: Expense[],
    startDate: Date,
    endDate: Date
  ): SpendingPattern | null {
    // Esta función requeriría datos de ubicación en los gastos
    // Por ahora retornamos null, se puede implementar cuando tengamos ubicaciones
    return null
  }

  private static findOverspentCategories(
    expenses: Expense[],
    budgets: any[]
  ): any[] {
    // Implementar lógica de categorías con sobregasto
    return []
  }

  private static findSavingsOpportunities(
    expenses: Expense[],
    predictions: SpendingPrediction[]
  ): any[] {
    // Implementar lógica de oportunidades de ahorro
    return []
  }

  private static getCategoryDistribution(
    expenses: Expense[]
  ): Record<string, number> {
    const distribution: Record<string, number> = {}

    expenses.forEach((expense) => {
      const categoryId = expense.category.id
      distribution[categoryId] =
        (distribution[categoryId] || 0) + expense.amount
    })

    return distribution
  }

  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }
}
