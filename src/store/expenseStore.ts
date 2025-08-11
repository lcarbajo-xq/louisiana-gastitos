import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Expense } from '../types/expense'

interface ExpenseStore {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  getExpensesByCategory: (categoryId: string) => Expense[]
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[]
  getTotalExpenses: () => number
  getExpensesForMonth: (month: number, year: number) => Expense[]
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    immer((set, get) => ({
      expenses: [],

      addExpense: (expense) =>
        set((state) => {
          const newExpense: Expense = {
            ...expense,
            id: uuidv4(),
            date: new Date(expense.date)
          }
          state.expenses.push(newExpense)
        }),

      updateExpense: (id, expenseUpdate) =>
        set((state) => {
          const index = state.expenses.findIndex((exp) => exp.id === id)
          if (index !== -1) {
            state.expenses[index] = {
              ...state.expenses[index],
              ...expenseUpdate,
              date: expenseUpdate.date
                ? new Date(expenseUpdate.date)
                : state.expenses[index].date
            }
          }
        }),

      deleteExpense: (id) =>
        set((state) => {
          state.expenses = state.expenses.filter((exp) => exp.id !== id)
        }),

      getExpensesByCategory: (categoryId) => {
        return get().expenses.filter(
          (expense) => expense.category.id === categoryId
        )
      },

      getExpensesByDateRange: (startDate, endDate) => {
        return get().expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= startDate && expenseDate <= endDate
        })
      },

      getTotalExpenses: () => {
        return get().expenses.reduce(
          (total, expense) => total + expense.amount,
          0
        )
      },

      getExpensesForMonth: (month, year) => {
        return get().expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return (
            expenseDate.getMonth() === month &&
            expenseDate.getFullYear() === year
          )
        })
      }
    })),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1
    }
  )
)
