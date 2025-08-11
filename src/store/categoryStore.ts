import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  CategoryFilter,
  CategoryStats,
  ExpenseCategory,
  MLCategoryPrediction
} from '../types/expense'

interface CategoryStore {
  categories: ExpenseCategory[]
  categoryStats: CategoryStats[]

  // CRUD operations
  addCategory: (
    category: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  updateCategory: (id: string, category: Partial<ExpenseCategory>) => void
  deleteCategory: (id: string) => void
  toggleCategoryActive: (id: string) => void

  // Search and filter
  searchCategories: (query: string) => ExpenseCategory[]
  filterCategories: (filters: CategoryFilter) => ExpenseCategory[]
  getCategoryById: (id: string) => ExpenseCategory | undefined
  getCategoriesByIds: (ids: string[]) => ExpenseCategory[]

  // Statistics
  getCategoryStats: (categoryId: string) => CategoryStats | undefined
  updateCategoryStats: (
    categoryId: string,
    stats: Partial<CategoryStats>
  ) => void
  getTopCategories: (limit?: number) => ExpenseCategory[]

  // Budget management
  updateCategoryBudget: (id: string, budget: number) => void
  getCategoriesOverBudget: () => ExpenseCategory[]

  // ML and suggestions
  predictCategory: (
    description: string,
    amount?: number
  ) => MLCategoryPrediction[]
  addKeywordToCategory: (categoryId: string, keyword: string) => void
  removeKeywordFromCategory: (categoryId: string, keyword: string) => void

  // Default categories
  getDefaultCategories: () => ExpenseCategory[]
  initializeDefaultCategories: () => void
  resetToDefaults: () => void
}

// Categorías predefinidas mejoradas con keywords para ML
const defaultCategories: Omit<
  ExpenseCategory,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  {
    name: 'Food & Drinks',
    icon: '�',
    color: '#F59E0B',
    budget: 500,
    isDefault: true,
    isActive: true,
    keywords: [
      'restaurant',
      'food',
      'grocery',
      'cafe',
      'dinner',
      'lunch',
      'breakfast',
      'snack',
      'takeout',
      'delivery',
      'pizza',
      'burger',
      'coffee',
      'bar',
      'pub',
      'supermarket',
      'market'
    ]
  },
  {
    name: 'Shopping',
    icon: '🛍️',
    color: '#EC4899',
    budget: 300,
    isDefault: true,
    isActive: true,
    keywords: [
      'store',
      'mall',
      'shop',
      'clothing',
      'amazon',
      'online',
      'purchase',
      'buy',
      'retail',
      'clothes',
      'shoes',
      'electronics',
      'gadget'
    ]
  },
  {
    name: 'Transport',
    icon: '🚗',
    color: '#10B981',
    budget: 200,
    isDefault: true,
    isActive: true,
    keywords: [
      'gas',
      'fuel',
      'uber',
      'taxi',
      'bus',
      'train',
      'metro',
      'parking',
      'toll',
      'car',
      'transport',
      'travel',
      'flight',
      'hotel'
    ]
  },
  {
    name: 'Health & Fitness',
    icon: '💪',
    color: '#8B5CF6',
    budget: 150,
    isDefault: true,
    isActive: true,
    keywords: [
      'gym',
      'fitness',
      'doctor',
      'hospital',
      'pharmacy',
      'medicine',
      'health',
      'medical',
      'dentist',
      'therapy',
      'workout',
      'sport'
    ]
  },
  {
    name: 'Education',
    icon: '📚',
    color: '#3B82F6',
    budget: 100,
    isDefault: true,
    isActive: true,
    keywords: [
      'school',
      'university',
      'course',
      'book',
      'education',
      'tuition',
      'learning',
      'training',
      'workshop',
      'seminar'
    ]
  },
  {
    name: 'Other',
    icon: '⚡',
    color: '#6B7280',
    budget: 100,
    isDefault: true,
    isActive: true,
    keywords: ['misc', 'other', 'various', 'general']
  }
]

// Algoritmo simple de ML para categorización
class SimpleCategoryML {
  static predictCategory(
    description: string,
    categories: ExpenseCategory[],
    amount?: number
  ): MLCategoryPrediction[] {
    const desc = description.toLowerCase().trim()
    const predictions: MLCategoryPrediction[] = []

    categories.forEach((category) => {
      if (!category.isActive || !category.keywords) return

      let confidence = 0
      let matchedKeywords: string[] = []

      // Buscar coincidencias de keywords
      category.keywords.forEach((keyword) => {
        const keywordLower = keyword.toLowerCase()
        if (desc.includes(keywordLower)) {
          const boost = keywordLower.length > 3 ? 0.2 : 0.1
          confidence += boost
          matchedKeywords.push(keyword)
        }
      })

      // Boost para categorías por defecto
      if (category.isDefault && confidence > 0) {
        confidence += 0.1
      }

      // Boost basado en cantidad (reglas simples)
      if (amount) {
        if (category.name === 'Food & Drinks' && amount < 50) {
          confidence += 0.1
        }
        if (category.name === 'Transport' && amount > 20 && amount < 100) {
          confidence += 0.1
        }
        if (category.name === 'Shopping' && amount > 50) {
          confidence += 0.05
        }
      }

      // Solo incluir si hay confianza mínima
      if (confidence > 0.1) {
        predictions.push({
          categoryId: category.id,
          confidence: Math.min(confidence, 0.95), // Max 95%
          matchedKeywords,
          reasoning: `Matched keywords: ${matchedKeywords.join(', ')}`
        })
      }
    })

    // Ordenar por confianza descendente
    return predictions.sort((a, b) => b.confidence - a.confidence)
  }
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    immer((set, get) => ({
      categories: [],
      categoryStats: [],

      // CRUD operations
      addCategory: (category) =>
        set((state) => {
          const newCategory: ExpenseCategory = {
            ...category,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
          state.categories.push(newCategory)
        }),

      updateCategory: (id, categoryUpdate) =>
        set((state) => {
          const index = state.categories.findIndex((cat) => cat.id === id)
          if (index !== -1) {
            state.categories[index] = {
              ...state.categories[index],
              ...categoryUpdate,
              updatedAt: new Date()
            }
          }
        }),

      deleteCategory: (id) =>
        set((state) => {
          state.categories = state.categories.filter((cat) => cat.id !== id)
          state.categoryStats = state.categoryStats.filter(
            (stat) => stat.categoryId !== id
          )
        }),

      toggleCategoryActive: (id) =>
        set((state) => {
          const index = state.categories.findIndex((cat) => cat.id === id)
          if (index !== -1) {
            state.categories[index].isActive = !state.categories[index].isActive
            state.categories[index].updatedAt = new Date()
          }
        }),

      // Search and filter
      searchCategories: (query) => {
        const { categories } = get()
        const queryLower = query.toLowerCase()
        return categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(queryLower) ||
            cat.keywords?.some((keyword) =>
              keyword.toLowerCase().includes(queryLower)
            )
        )
      },

      filterCategories: (filters) => {
        const { categories } = get()
        return categories.filter((cat) => {
          if (
            filters.name &&
            !cat.name.toLowerCase().includes(filters.name.toLowerCase())
          ) {
            return false
          }
          if (
            filters.minBudget &&
            (!cat.budget || cat.budget < filters.minBudget)
          ) {
            return false
          }
          if (
            filters.maxBudget &&
            (!cat.budget || cat.budget > filters.maxBudget)
          ) {
            return false
          }
          if (
            filters.isActive !== undefined &&
            cat.isActive !== filters.isActive
          ) {
            return false
          }
          return true
        })
      },

      getCategoryById: (id) => {
        const { categories } = get()
        return categories.find((cat) => cat.id === id)
      },

      getCategoriesByIds: (ids) => {
        const { categories } = get()
        return categories.filter((cat) => ids.includes(cat.id))
      },

      // Statistics
      getCategoryStats: (categoryId) => {
        const { categoryStats } = get()
        return categoryStats.find((stat) => stat.categoryId === categoryId)
      },

      updateCategoryStats: (categoryId, stats) =>
        set((state) => {
          const index = state.categoryStats.findIndex(
            (stat) => stat.categoryId === categoryId
          )
          if (index !== -1) {
            state.categoryStats[index] = {
              ...state.categoryStats[index],
              ...stats
            }
          } else {
            state.categoryStats.push({
              categoryId,
              totalSpent: 0,
              transactionCount: 0,
              averageAmount: 0,
              monthlyTrend: 0,
              ...stats
            })
          }
        }),

      getTopCategories: (limit = 5) => {
        const { categories, categoryStats } = get()
        const statsMap = new Map(
          categoryStats.map((stat) => [stat.categoryId, stat])
        )

        return categories
          .filter((cat) => cat.isActive)
          .sort((a, b) => {
            const aStats = statsMap.get(a.id)
            const bStats = statsMap.get(b.id)
            const aCount = aStats?.transactionCount || 0
            const bCount = bStats?.transactionCount || 0
            return bCount - aCount
          })
          .slice(0, limit)
      },

      // Budget management
      updateCategoryBudget: (id, budget) =>
        set((state) => {
          const index = state.categories.findIndex((cat) => cat.id === id)
          if (index !== -1) {
            state.categories[index].budget = budget
            state.categories[index].updatedAt = new Date()
          }
        }),

      getCategoriesOverBudget: () => {
        const { categories, categoryStats } = get()
        const statsMap = new Map(
          categoryStats.map((stat) => [stat.categoryId, stat])
        )

        return categories.filter((cat) => {
          if (!cat.budget || cat.budget === 0) return false
          const stats = statsMap.get(cat.id)
          return stats && stats.totalSpent > cat.budget
        })
      },

      // ML and suggestions
      predictCategory: (description, amount) => {
        const { categories } = get()
        return SimpleCategoryML.predictCategory(description, categories, amount)
      },

      addKeywordToCategory: (categoryId, keyword) =>
        set((state) => {
          const index = state.categories.findIndex(
            (cat) => cat.id === categoryId
          )
          if (index !== -1) {
            const keywords = state.categories[index].keywords || []
            if (!keywords.includes(keyword.toLowerCase())) {
              state.categories[index].keywords = [
                ...keywords,
                keyword.toLowerCase()
              ]
              state.categories[index].updatedAt = new Date()
            }
          }
        }),

      removeKeywordFromCategory: (categoryId, keyword) =>
        set((state) => {
          const index = state.categories.findIndex(
            (cat) => cat.id === categoryId
          )
          if (index !== -1) {
            const keywords = state.categories[index].keywords || []
            state.categories[index].keywords = keywords.filter(
              (k) => k !== keyword.toLowerCase()
            )
            state.categories[index].updatedAt = new Date()
          }
        }),

      // Default categories
      getDefaultCategories: () => {
        return defaultCategories.map((cat) => ({
          ...cat,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      },

      initializeDefaultCategories: () =>
        set((state) => {
          if (state.categories.length === 0) {
            state.categories = defaultCategories.map((cat) => ({
              ...cat,
              id: uuidv4(),
              createdAt: new Date(),
              updatedAt: new Date()
            }))
          }
        }),

      resetToDefaults: () =>
        set((state) => {
          state.categories = defaultCategories.map((cat) => ({
            ...cat,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
          }))
          state.categoryStats = []
        })
    })),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2
    }
  )
)
