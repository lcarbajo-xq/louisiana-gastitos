import {
  DataExport,
  GoogleSheetsIntegration,
  SavingsGoal,
  SmartBudget
} from '../types/advanced'
import { Expense } from '../types/expense'

export class ExportService {
  /**
   * Exporta datos a CSV
   */
  static async exportToCSV(
    data: {
      expenses?: Expense[]
      budgets?: SmartBudget[]
      savings?: SavingsGoal[]
    },
    exportConfig: Omit<
      DataExport,
      'id' | 'status' | 'downloadUrl' | 'createdAt' | 'expiresAt'
    >
  ): Promise<string> {
    let csvContent = ''

    if (data.expenses && exportConfig.type === 'expenses') {
      csvContent = this.generateExpensesCSV(data.expenses, exportConfig)
    } else if (data.budgets && exportConfig.type === 'budgets') {
      csvContent = this.generateBudgetsCSV(data.budgets)
    } else if (exportConfig.type === 'full') {
      csvContent = this.generateFullCSV(data)
    }

    return csvContent
  }

  /**
   * Exporta datos a Excel (formato CSV avanzado)
   */
  static async exportToExcel(
    data: {
      expenses?: Expense[]
      budgets?: SmartBudget[]
      savings?: SavingsGoal[]
    },
    exportConfig: Omit<
      DataExport,
      'id' | 'status' | 'downloadUrl' | 'createdAt' | 'expiresAt'
    >
  ): Promise<string> {
    // Para React Native, usaremos CSV con formato Excel
    const csvContent = await this.exportToCSV(data, exportConfig)
    return csvContent
  }

  /**
   * Exporta datos a JSON
   */
  static async exportToJSON(
    data: {
      expenses?: Expense[]
      budgets?: SmartBudget[]
      savings?: SavingsGoal[]
    },
    exportConfig: Omit<
      DataExport,
      'id' | 'status' | 'downloadUrl' | 'createdAt' | 'expiresAt'
    >
  ): Promise<string> {
    const filteredData = this.applyFilters(data, exportConfig)

    const exportData = {
      exportInfo: {
        type: exportConfig.type,
        dateRange: exportConfig.dateRange,
        generatedAt: new Date().toISOString(),
        recordCount: this.getRecordCount(filteredData)
      },
      data: filteredData
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Integración con Google Sheets
   */
  static async syncWithGoogleSheets(
    integration: GoogleSheetsIntegration,
    data: {
      expenses?: Expense[]
      budgets?: SmartBudget[]
    }
  ): Promise<boolean> {
    try {
      // En una implementación real, aquí se haría la llamada a la API de Google Sheets
      console.log(`Syncing with Google Sheets: ${integration.spreadsheetName}`)

      if (data.expenses && integration.mappings.expenses) {
        this.generateExpensesCSV(data.expenses, {
          format: 'csv',
          type: 'expenses',
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        })

        // Simulado - implementar API real de Google Sheets
        console.log('Expenses data prepared for Google Sheets sync')
      }

      return true
    } catch (error) {
      console.error('Error syncing with Google Sheets:', error)
      return false
    }
  }

  /**
   * Programa sincronización automática con Google Sheets
   */
  static scheduleGoogleSheetsSync(
    integrations: GoogleSheetsIntegration[]
  ): void {
    integrations
      .filter(
        (integration) =>
          integration.isActive && integration.syncType === 'automatic'
      )
      .forEach((integration) => {
        console.log(
          `Scheduled Google Sheets sync for ${integration.spreadsheetName}`
        )
        // En producción, programar con job scheduler
      })
  }

  /**
   * Valida configuración de Google Sheets
   */
  static async validateGoogleSheetsConfig(
    integration: Omit<GoogleSheetsIntegration, 'id' | 'createdAt'>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!integration.spreadsheetId) {
      errors.push('ID de spreadsheet requerido')
    }

    if (!integration.mappings.expenses?.sheetName) {
      errors.push('Nombre de hoja para gastos requerido')
    }

    if (!integration.authToken) {
      errors.push('Token de autenticación requerido')
    }

    // Validar acceso a spreadsheet (simulado)
    try {
      console.log('Validating Google Sheets access...')
      // Aquí se haría una llamada real a la API
    } catch {
      errors.push('No se puede acceder al spreadsheet')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Métodos privados

  private static generateExpensesCSV(
    expenses: Expense[],
    exportConfig: Omit<
      DataExport,
      'id' | 'status' | 'downloadUrl' | 'createdAt' | 'expiresAt'
    >
  ): string {
    const filteredExpenses = this.filterExpensesByDateAndCriteria(
      expenses,
      exportConfig
    )

    // Headers
    const headers = [
      'Fecha',
      'Descripción',
      'Monto',
      'Categoría',
      'Método de Pago',
      'Ubicación',
      'Etiquetas'
    ]

    // Generar filas
    const rows = filteredExpenses.map((expense) => [
      expense.date.toLocaleDateString(),
      `"${expense.description}"`,
      expense.amount.toString(),
      `"${expense.category.name}"`,
      expense.paymentMethod || '',
      `"${expense.location || ''}"`,
      `"${expense.tags?.join(', ') || ''}"`
    ])

    // Combinar headers y datos
    const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
    return csvLines.join('\n')
  }

  private static generateBudgetsCSV(budgets: SmartBudget[]): string {
    const headers = [
      'ID',
      'Categoría',
      'Monto',
      'Período',
      'Umbral Advertencia',
      'Umbral Peligro',
      'Ajuste Inteligente',
      'Promedio Histórico'
    ]

    const rows = budgets.map((budget) => [
      budget.id,
      budget.categoryId,
      budget.amount.toString(),
      budget.period,
      budget.alertThresholds.warning.toString(),
      budget.alertThresholds.danger.toString(),
      budget.smartAdjustment.toString(),
      budget.historicalAverage.toString()
    ])

    const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
    return csvLines.join('\n')
  }

  private static generateFullCSV(data: {
    expenses?: Expense[]
    budgets?: SmartBudget[]
    savings?: SavingsGoal[]
  }): string {
    let content = ''

    if (data.expenses) {
      content += '=== GASTOS ===\n'
      content += this.generateExpensesCSV(data.expenses, {
        format: 'csv',
        type: 'expenses',
        dateRange: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      })
      content += '\n\n'
    }

    if (data.budgets) {
      content += '=== PRESUPUESTOS ===\n'
      content += this.generateBudgetsCSV(data.budgets)
      content += '\n\n'
    }

    if (data.savings) {
      content += '=== METAS DE AHORRO ===\n'
      content += this.generateSavingsCSV(data.savings)
    }

    return content
  }

  private static generateSavingsCSV(savings: SavingsGoal[]): string {
    const headers = [
      'ID',
      'Título',
      'Monto Objetivo',
      'Monto Actual',
      'Fecha Objetivo',
      'Categoría',
      'Prioridad',
      'Progreso %'
    ]

    const rows = savings.map((goal) => {
      const progress =
        goal.targetAmount > 0
          ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
          : 0

      return [
        goal.id,
        `"${goal.title}"`,
        goal.targetAmount.toString(),
        goal.currentAmount.toString(),
        goal.targetDate.toLocaleDateString(),
        goal.category,
        goal.priority,
        progress.toString()
      ]
    })

    const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
    return csvLines.join('\n')
  }

  private static applyFilters(
    data: {
      expenses?: Expense[]
      budgets?: SmartBudget[]
      savings?: SavingsGoal[]
    },
    exportConfig: Omit<
      DataExport,
      'id' | 'status' | 'downloadUrl' | 'createdAt' | 'expiresAt'
    >
  ) {
    const result = { ...data }

    if (result.expenses) {
      result.expenses = this.filterExpensesByDateAndCriteria(
        result.expenses,
        exportConfig
      )
    }

    return result
  }

  private static filterExpensesByDateAndCriteria(
    expenses: Expense[],
    exportConfig: Omit<
      DataExport,
      'id' | 'status' | 'downloadUrl' | 'createdAt' | 'expiresAt'
    >
  ): Expense[] {
    return expenses.filter((expense) => {
      // Filtro por fecha
      if (
        expense.date < exportConfig.dateRange.start ||
        expense.date > exportConfig.dateRange.end
      ) {
        return false
      }

      // Filtros adicionales
      if (exportConfig.filters) {
        if (
          exportConfig.filters.categories &&
          !exportConfig.filters.categories.includes(expense.category.id)
        ) {
          return false
        }

        if (
          exportConfig.filters.minAmount &&
          expense.amount < exportConfig.filters.minAmount
        ) {
          return false
        }

        if (
          exportConfig.filters.maxAmount &&
          expense.amount > exportConfig.filters.maxAmount
        ) {
          return false
        }
      }

      return true
    })
  }

  private static getRecordCount(data: {
    expenses?: Expense[]
    budgets?: SmartBudget[]
    savings?: SavingsGoal[]
  }): number {
    let count = 0
    if (data.expenses) count += data.expenses.length
    if (data.budgets) count += data.budgets.length
    if (data.savings) count += data.savings.length
    return count
  }

  /**
   * Guarda archivo exportado localmente
   */
  static async saveExportFile(
    content: string,
    filename: string
  ): Promise<string> {
    try {
      // En React Native, usar react-native-fs o similar
      const filePath = `exports/${filename}`
      console.log(`Saving export file: ${filePath}`)

      // Simulado - implementar guardado real
      return filePath
    } catch (error) {
      console.error('Error saving export file:', error)
      throw error
    }
  }

  /**
   * Comparte archivo exportado
   */
  static async shareExportFile(filePath: string): Promise<void> {
    try {
      // Usar react-native-share para compartir archivos
      console.log(`Sharing export file: ${filePath}`)

      // Simulado - implementar compartir real
    } catch (error) {
      console.error('Error sharing export file:', error)
      throw error
    }
  }
}
