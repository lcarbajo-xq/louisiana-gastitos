import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { ExpenseCategory } from '../types/expense'

interface CategoryStore {
  categories: ExpenseCategory[]
  addCategory: (category: Omit<ExpenseCategory, 'id'>) => void
  updateCategory: (id: string, category: Partial<ExpenseCategory>) => void
  deleteCategory: (id: string) => void
  getDefaultCategories: () => ExpenseCategory[]
  initializeDefaultCategories: () => void
}

const defaultCategories: Omit<ExpenseCategory, 'id'>[] = [
  {
    name: 'Food',
    icon: '🍕',
    color: '#F59E0B',
    budget: 500
  },
  {
    name: 'Shopping',
    icon: '🛍️',
    color: '#EC4899',
    budget: 300
  },
  {
    name: 'Transport',
    icon: '🚗',
    color: '#10B981',
    budget: 200
  },
  {
    name: 'Health & Fitness',
    icon: '💪',
    color: '#8B5CF6',
    budget: 150
  },
  {
    name: 'Education',
    icon: '📚',
    color: '#3B82F6',
    budget: 100
  },
  {
    name: 'Other',
    icon: '⚡',
    color: '#6B7280',
    budget: 100
  }
]

export const useCategoryStore = create<CategoryStore>()(
  persist(
    immer((set, get) => ({
      categories: [],

      addCategory: (category) =>
        set((state) => {
          const newCategory: ExpenseCategory = {
            ...category,
            id: uuidv4()
          }
          state.categories.push(newCategory)
        }),

      updateCategory: (id, categoryUpdate) =>
        set((state) => {
          const index = state.categories.findIndex((cat) => cat.id === id)
          if (index !== -1) {
            state.categories[index] = {
              ...state.categories[index],
              ...categoryUpdate
            }
          }
        }),

      deleteCategory: (id) =>
        set((state) => {
          state.categories = state.categories.filter((cat) => cat.id !== id)
        }),

      getDefaultCategories: () => {
        return defaultCategories.map((cat) => ({
          ...cat,
          id: uuidv4()
        }))
      },

      initializeDefaultCategories: () =>
        set((state) => {
          if (state.categories.length === 0) {
            state.categories = defaultCategories.map((cat) => ({
              ...cat,
              id: uuidv4()
            }))
          }
        })
    })),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1
    }
  )
)
