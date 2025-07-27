import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ExpenseCategory } from '../types'

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'food',
    name: 'Food',
    icon: '🍕',
    color: '#F59E0B'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#EC4899'
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: '#8B5CF6'
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: '💪',
    color: '#6366F1'
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#3B82F6'
  },
  {
    id: 'other',
    name: 'Other',
    icon: '⚪',
    color: '#6B7280'
  }
]

interface CategoryStore {
  categories: ExpenseCategory[]
  addCategory: (category: Omit<ExpenseCategory, 'id'>) => void
  updateCategory: (id: string, category: Partial<ExpenseCategory>) => void
  deleteCategory: (id: string) => void
  getDefaultCategories: () => ExpenseCategory[]
  resetToDefaults: () => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,

      addCategory: (category) => {
        const newCategory: ExpenseCategory = {
          ...category,
          id: Date.now().toString()
        }
        set((state) => ({
          categories: [...state.categories, newCategory]
        }))
      },

      updateCategory: (id, updatedCategory) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updatedCategory } : category
          )
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id)
        }))
      },

      getDefaultCategories: () => {
        return DEFAULT_CATEGORIES
      },

      resetToDefaults: () => {
        set({ categories: DEFAULT_CATEGORIES })
      }
    }),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)
