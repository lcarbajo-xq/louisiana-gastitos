import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear
} from 'date-fns'
import { es } from 'date-fns/locale'

export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount)
}

export const formatDate = (
  date: Date,
  formatString: string = 'dd/MM/yyyy'
): string => {
  return format(date, formatString, { locale: es })
}

export const getDateRange = (
  period: 'week' | 'month' | 'year',
  date: Date = new Date()
) => {
  switch (period) {
    case 'week':
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 })
      }
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date)
      }
    case 'year':
      return {
        start: startOfYear(date),
        end: endOfYear(date)
      }
    default:
      return {
        start: startOfMonth(date),
        end: endOfMonth(date)
      }
  }
}

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}
