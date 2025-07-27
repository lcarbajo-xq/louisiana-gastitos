import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Expense } from '../types'

interface ExpenseStore {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  getExpensesByCategory: (categoryId: string) => Expense[]
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[]
  clearAllExpenses: () => void
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: Date.now().toString()
        }
        set((state) => ({
          expenses: [newExpense, ...state.expenses]
        }))
      },

      updateExpense: (id, updatedExpense) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...updatedExpense } : expense
          )
        }))
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id)
        }))
      },

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

      clearAllExpenses: () => {
        set({ expenses: [] })
      }
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)
