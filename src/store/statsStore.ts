import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  BudgetStatus,
  CategoryBreakdown,
  MonthlyStats,
  Period
} from '../types/expense'
import { useCategoryStore } from './categoryStore'
import { useExpenseStore } from './expenseStore'

interface StatsStore {
  monthlyStats: MonthlyStats
  calculateMonthlyStats: () => void
  getTotalExpenses: (period: Period) => number
  getCategoryBreakdown: (period: Period) => CategoryBreakdown[]
  getBudgetStatus: (categoryId: string) => BudgetStatus | null
  getAllBudgetStatuses: () => BudgetStatus[]
}

export const useStatsStore = create<StatsStore>()(
  persist(
    immer((set, get) => ({
      monthlyStats: {
        totalExpenses: 0,
        categoryBreakdown: [],
        comparedToLastMonth: 0,
        budgetStatus: []
      },

      calculateMonthlyStats: () => {
        const expenses = useExpenseStore.getState().expenses
        const categories = useCategoryStore.getState().categories
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        // Filtrar gastos del mes actual
        const currentMonthExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
          )
        })

        // Calcular total de gastos
        const totalExpenses = currentMonthExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        )

        // Calcular breakdown por categoría
        const categoryBreakdown: CategoryBreakdown[] = categories
          .map((category) => {
            const categoryExpenses = currentMonthExpenses.filter(
              (expense) => expense.category.id === category.id
            )
            const amount = categoryExpenses.reduce(
              (sum, expense) => sum + expense.amount,
              0
            )

            return {
              categoryId: category.id,
              categoryName: category.name,
              amount,
              percentage:
                totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
              count: categoryExpenses.length,
              color: category.color
            }
          })
          .filter((breakdown) => breakdown.amount > 0)

        // Calcular comparación con mes anterior
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

        const lastMonthExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return (
            expenseDate.getMonth() === lastMonth &&
            expenseDate.getFullYear() === lastMonthYear
          )
        })

        const lastMonthTotal = lastMonthExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        )
        const comparedToLastMonth =
          lastMonthTotal > 0
            ? ((totalExpenses - lastMonthTotal) / lastMonthTotal) * 100
            : 0

        // Calcular status de presupuestos
        const budgetStatus: BudgetStatus[] = categories
          .filter((category) => category.budget && category.budget > 0)
          .map((category) => {
            const spent = currentMonthExpenses
              .filter((expense) => expense.category.id === category.id)
              .reduce((sum, expense) => sum + expense.amount, 0)

            const budget = category.budget || 0
            const remaining = budget - spent
            const percentage = budget > 0 ? (spent / budget) * 100 : 0

            return {
              categoryId: category.id,
              spent,
              budget,
              remaining,
              isOverBudget: spent > budget,
              percentage
            }
          })

        set((state) => {
          state.monthlyStats = {
            totalExpenses,
            categoryBreakdown,
            comparedToLastMonth,
            budgetStatus
          }
        })
      },

      getTotalExpenses: (period) => {
        const expenses = useExpenseStore.getState().expenses
        const now = new Date()
        let startDate: Date

        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
        }

        return expenses
          .filter((expense) => new Date(expense.date) >= startDate)
          .reduce((sum, expense) => sum + expense.amount, 0)
      },

      getCategoryBreakdown: (period) => {
        get().calculateMonthlyStats()
        return get().monthlyStats.categoryBreakdown
      },

      getBudgetStatus: (categoryId) => {
        get().calculateMonthlyStats()
        return (
          get().monthlyStats.budgetStatus.find(
            (status) => status.categoryId === categoryId
          ) || null
        )
      },

      getAllBudgetStatuses: () => {
        get().calculateMonthlyStats()
        return get().monthlyStats.budgetStatus
      }
    })),
    {
      name: 'stats-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1
    }
  )
)
