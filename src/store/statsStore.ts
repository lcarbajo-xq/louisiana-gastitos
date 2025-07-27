import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { BudgetStatus, CategoryBreakdown, MonthlyStats } from '../types'

interface StatsStore {
  monthlyStats: MonthlyStats | null
  calculateMonthlyStats: () => void
  getTotalExpenses: (period: 'week' | 'month' | 'year') => number
  getCategoryBreakdown: (period: string) => CategoryBreakdown[]
  getBudgetStatus: (categoryId: string) => BudgetStatus | null
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      monthlyStats: null,

      calculateMonthlyStats: () => {
        // Esta función será implementada cuando tengamos los datos de gastos
        console.log('Calculating monthly stats...')
      },

      getTotalExpenses: (period) => {
        // Implementación futura con integración de expense store
        console.log(`Getting total expenses for ${period}`)
        return 0
      },

      getCategoryBreakdown: (period) => {
        // Implementación futura
        console.log(`Getting category breakdown for ${period}`)
        return []
      },

      getBudgetStatus: (categoryId) => {
        // Implementación futura
        console.log(`Getting budget status for ${categoryId}`)
        return null
      }
    }),
    {
      name: 'stats-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)
