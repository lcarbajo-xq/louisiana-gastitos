import { useEffect } from 'react'
import { useExpenseStore } from '../store/expenseStore'
import { useStatsStore } from '../store/statsStore'

/**
 * Hook para sincronizar automáticamente las estadísticas
 * cuando cambian los gastos
 */
export const useSyncStores = () => {
  const calculateMonthlyStats = useStatsStore(
    (state) => state.calculateMonthlyStats
  )
  const expenses = useExpenseStore((state) => state.expenses)

  useEffect(() => {
    // Recalcular estadísticas cuando cambien los gastos
    calculateMonthlyStats()
  }, [expenses, calculateMonthlyStats])
}

/**
 * Hook para obtener estadísticas actualizadas en tiempo real
 */
export const useRealtimeStats = () => {
  const statsStore = useStatsStore()
  const expenses = useExpenseStore((state) => state.expenses)

  useEffect(() => {
    statsStore.calculateMonthlyStats()
  }, [expenses, statsStore])

  return {
    monthlyStats: statsStore.monthlyStats,
    getTotalExpenses: statsStore.getTotalExpenses,
    getCategoryBreakdown: statsStore.getCategoryBreakdown,
    getBudgetStatus: statsStore.getBudgetStatus,
    getAllBudgetStatuses: statsStore.getAllBudgetStatuses
  }
}
