import {
  AutoReport,
  SavingsGoal,
  SmartBudget,
  SpendingPrediction
} from '../../types/advanced'
import { Expense } from '../../types/expense'

export class ReportService {
  /**
   * Genera reporte automático basado en configuración
   */
  static async generateAutoReport(
    reportConfig: AutoReport,
    expenses: Expense[],
    budgets: SmartBudget[],
    savings: SavingsGoal[],
    predictions: SpendingPrediction[]
  ): Promise<string> {
    const reportData = {
      title: reportConfig.name,
      period: this.getCurrentPeriod(reportConfig.type),
      generatedAt: new Date(),
      sections: {}
    }

    // Generar secciones según configuración
    if (reportConfig.includeSections.overview) {
      reportData.sections = {
        ...reportData.sections,
        overview: this.generateOverviewSection(expenses)
      }
    }

    if (reportConfig.includeSections.categoryBreakdown) {
      reportData.sections = {
        ...reportData.sections,
        categoryBreakdown: this.generateCategoryBreakdown(expenses)
      }
    }

    if (reportConfig.includeSections.budgetStatus) {
      reportData.sections = {
        ...reportData.sections,
        budgetStatus: this.generateBudgetStatus(expenses, budgets)
      }
    }

    if (reportConfig.includeSections.savings) {
      reportData.sections = {
        ...reportData.sections,
        savings: this.generateSavingsSection(savings)
      }
    }

    if (reportConfig.includeSections.predictions) {
      reportData.sections = {
        ...reportData.sections,
        predictions: this.generatePredictionsSection(predictions)
      }
    }

    if (reportConfig.includeSections.recommendations) {
      reportData.sections = {
        ...reportData.sections,
        recommendations: await this.generateRecommendationsSection(
          expenses,
          budgets
        )
      }
    }

    return this.formatReport(reportData, reportConfig.template)
  }

  /**
   * Programa envío de reportes automáticos
   */
  static scheduleAutoReports(reports: AutoReport[]): void {
    reports
      .filter((report) => report.isActive)
      .forEach((report) => {
        // En una implementación real, esto se programaría con un job scheduler
        console.log(
          `Scheduled report: ${report.name} for ${report.schedule.time}`
        )
      })
  }

  /**
   * Envía reporte por email
   */
  static async sendReportByEmail(
    reportContent: string,
    recipients: string[],
    subject: string
  ): Promise<boolean> {
    try {
      // Integración con servicio de email (SendGrid, AWS SES, etc.)
      console.log(`Sending report to: ${recipients.join(', ')}`)
      console.log(`Subject: ${subject}`)
      console.log('Content:', reportContent)

      // Simulado - en producción implementar servicio real
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  /**
   * Genera PDF del reporte
   */
  static async generatePDF(reportContent: string): Promise<string> {
    try {
      // Integración con librería PDF (react-native-html-to-pdf, etc.)
      const pdfPath = `reports/report_${Date.now()}.pdf`

      // Simulado - implementar generación real de PDF
      console.log('Generating PDF:', pdfPath)

      return pdfPath
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  // Métodos privados para generar secciones

  private static getCurrentPeriod(type: 'weekly' | 'monthly' | 'quarterly'): {
    start: Date
    end: Date
  } {
    const now = new Date()
    const end = new Date(now)
    let start: Date

    switch (type) {
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), quarter * 3, 1)
        break
    }

    return { start, end }
  }

  private static generateOverviewSection(expenses: Expense[]) {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const transactionCount = expenses.length
    const averageTransaction =
      transactionCount > 0 ? totalExpenses / transactionCount : 0

    const lastWeekExpenses = expenses.filter((exp) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return exp.date >= weekAgo
    })

    const lastWeekTotal = lastWeekExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    )

    return {
      totalExpenses,
      transactionCount,
      averageTransaction: Math.round(averageTransaction * 100) / 100,
      lastWeekTotal,
      dailyAverage: Math.round((totalExpenses / 30) * 100) / 100
    }
  }

  private static generateCategoryBreakdown(expenses: Expense[]) {
    const breakdown: Record<
      string,
      { amount: number; count: number; percentage: number }
    > = {}
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    expenses.forEach((expense) => {
      const categoryId = expense.category.id
      if (!breakdown[categoryId]) {
        breakdown[categoryId] = { amount: 0, count: 0, percentage: 0 }
      }
      breakdown[categoryId].amount += expense.amount
      breakdown[categoryId].count += 1
    })

    // Calcular porcentajes
    Object.keys(breakdown).forEach((categoryId) => {
      breakdown[categoryId].percentage =
        totalAmount > 0
          ? Math.round((breakdown[categoryId].amount / totalAmount) * 100)
          : 0
    })

    return breakdown
  }

  private static generateBudgetStatus(
    expenses: Expense[],
    budgets: SmartBudget[]
  ) {
    const status = budgets.map((budget) => {
      const categoryExpenses = expenses.filter(
        (exp) => exp.category.id === budget.categoryId
      )
      const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

      let status: 'under' | 'warning' | 'danger' | 'over' = 'under'
      if (percentage > 100) status = 'over'
      else if (percentage > budget.alertThresholds.danger) status = 'danger'
      else if (percentage > budget.alertThresholds.warning) status = 'warning'

      return {
        categoryId: budget.categoryId,
        budgetAmount: budget.amount,
        spentAmount: spent,
        percentage: Math.round(percentage),
        status,
        remaining: Math.max(0, budget.amount - spent)
      }
    })

    return status
  }

  private static generateSavingsSection(savings: SavingsGoal[]) {
    return savings.map((goal) => {
      const progress =
        goal.targetAmount > 0
          ? (goal.currentAmount / goal.targetAmount) * 100
          : 0

      const daysLeft = Math.ceil(
        (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      const dailyRequired =
        daysLeft > 0 ? (goal.targetAmount - goal.currentAmount) / daysLeft : 0

      return {
        id: goal.id,
        title: goal.title,
        progress: Math.round(progress),
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        daysLeft: Math.max(0, daysLeft),
        dailyRequired: Math.max(0, Math.round(dailyRequired * 100) / 100)
      }
    })
  }

  private static generatePredictionsSection(predictions: SpendingPrediction[]) {
    return predictions.map((prediction) => ({
      categoryId: prediction.categoryId,
      predictedAmount: prediction.predictedAmount,
      confidence: Math.round(prediction.confidence * 100),
      period: prediction.period,
      factors: prediction.factors
    }))
  }

  private static async generateRecommendationsSection(
    expenses: Expense[],
    budgets: SmartBudget[]
  ) {
    // Importar MLAnalysisService aquí para evitar dependencias circulares
    const { MLAnalysisService } = await import('../analytics/MLAnalysisService')
    const recommendations = MLAnalysisService.generateRecommendations(
      expenses,
      budgets,
      []
    )

    return recommendations.slice(0, 5).map((rec) => ({
      title: rec.title,
      description: rec.description,
      impact: rec.impact,
      potentialSavings: rec.potentialSavings,
      actionRequired: rec.actionRequired
    }))
  }

  private static formatReport(
    data: any,
    template: 'summary' | 'detailed' | 'categories' | 'custom'
  ): string {
    switch (template) {
      case 'summary':
        return this.formatSummaryReport(data)
      case 'detailed':
        return this.formatDetailedReport(data)
      case 'categories':
        return this.formatCategoriesReport(data)
      default:
        return this.formatSummaryReport(data)
    }
  }

  private static formatSummaryReport(data: any): string {
    return `
# Reporte de Gastos - ${data.title}
**Período:** ${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}
**Generado:** ${data.generatedAt.toLocaleString()}

## Resumen Ejecutivo
- **Total gastado:** $${
      data.sections.overview?.totalExpenses?.toFixed(2) || '0.00'
    }
- **Transacciones:** ${data.sections.overview?.transactionCount || 0}
- **Promedio por transacción:** $${
      data.sections.overview?.averageTransaction?.toFixed(2) || '0.00'
    }
- **Promedio diario:** $${
      data.sections.overview?.dailyAverage?.toFixed(2) || '0.00'
    }

## Estado de Presupuestos
${this.formatBudgetStatus(data.sections.budgetStatus)}

## Metas de Ahorro
${this.formatSavingsStatus(data.sections.savings)}

---
*Reporte generado automáticamente por Expense Tracker*
    `.trim()
  }

  private static formatDetailedReport(data: any): string {
    return `
# Reporte Detallado de Gastos - ${data.title}
**Período:** ${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}
**Generado:** ${data.generatedAt.toLocaleString()}

## Resumen Ejecutivo
- **Total gastado:** $${
      data.sections.overview?.totalExpenses?.toFixed(2) || '0.00'
    }
- **Transacciones:** ${data.sections.overview?.transactionCount || 0}
- **Promedio por transacción:** $${
      data.sections.overview?.averageTransaction?.toFixed(2) || '0.00'
    }

## Desglose por Categorías
${this.formatCategoryBreakdown(data.sections.categoryBreakdown)}

## Estado de Presupuestos
${this.formatBudgetStatus(data.sections.budgetStatus)}

## Predicciones
${this.formatPredictions(data.sections.predictions)}

## Recomendaciones
${this.formatRecommendations(data.sections.recommendations)}

---
*Reporte generado automáticamente por Expense Tracker*
    `.trim()
  }

  private static formatCategoriesReport(data: any): string {
    return `
# Reporte por Categorías - ${data.title}
**Período:** ${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}

## Desglose Detallado por Categorías
${this.formatCategoryBreakdown(data.sections.categoryBreakdown)}

## Estado de Presupuestos por Categoría
${this.formatBudgetStatus(data.sections.budgetStatus)}

---
*Reporte generado automáticamente por Expense Tracker*
    `.trim()
  }

  private static formatBudgetStatus(budgetStatus: any[]): string {
    if (!budgetStatus || budgetStatus.length === 0) {
      return 'No hay presupuestos configurados.'
    }

    return budgetStatus
      .map(
        (budget) =>
          `- **${budget.categoryId}:** $${budget.spentAmount.toFixed(
            2
          )} / $${budget.budgetAmount.toFixed(2)} (${
            budget.percentage
          }%) - ${budget.status.toUpperCase()}`
      )
      .join('\n')
  }

  private static formatSavingsStatus(savings: any[]): string {
    if (!savings || savings.length === 0) {
      return 'No hay metas de ahorro configuradas.'
    }

    return savings
      .map(
        (goal) =>
          `- **${goal.title}:** $${goal.currentAmount.toFixed(
            2
          )} / $${goal.targetAmount.toFixed(2)} (${goal.progress}%) - ${
            goal.daysLeft
          } días restantes`
      )
      .join('\n')
  }

  private static formatCategoryBreakdown(breakdown: any): string {
    if (!breakdown) return 'No hay datos de categorías disponibles.'

    return Object.entries(breakdown)
      .map(
        ([categoryId, data]: [string, any]) =>
          `- **${categoryId}:** $${data.amount.toFixed(2)} (${
            data.percentage
          }%) - ${data.count} transacciones`
      )
      .join('\n')
  }

  private static formatPredictions(predictions: any[]): string {
    if (!predictions || predictions.length === 0) {
      return 'No hay predicciones disponibles.'
    }

    return predictions
      .map(
        (pred) =>
          `- **${pred.categoryId}:** $${pred.predictedAmount.toFixed(
            2
          )} estimado para el próximo ${pred.period} (confianza: ${
            pred.confidence
          }%)`
      )
      .join('\n')
  }

  private static formatRecommendations(recommendations: any[]): string {
    if (!recommendations || recommendations.length === 0) {
      return 'No hay recomendaciones en este momento.'
    }

    return recommendations
      .map(
        (rec) =>
          `- **${rec.title}:** ${rec.description} (Impacto: ${rec.impact})`
      )
      .join('\n')
  }
}
