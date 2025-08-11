import { useMemo } from 'react'
import { useCategoryStore } from '../store/categoryStore'
import {
  CategoryFilter,
  ExpenseCategory,
  MLCategoryPrediction
} from '../types/expense'

/**
 * Hook para manejo avanzado de categorías con funciones de búsqueda y filtrado
 */
export const useCategories = () => {
  const store = useCategoryStore()

  return useMemo(
    () => ({
      // Estado
      categories: store.categories,
      categoryStats: store.categoryStats,

      // Operaciones CRUD
      addCategory: store.addCategory,
      updateCategory: store.updateCategory,
      deleteCategory: store.deleteCategory,
      toggleActive: store.toggleCategoryActive,

      // Búsqueda y filtrado
      search: store.searchCategories,
      filter: store.filterCategories,
      getById: store.getCategoryById,
      getByIds: store.getCategoriesByIds,

      // Estadísticas
      getStats: store.getCategoryStats,
      updateStats: store.updateCategoryStats,
      getTopCategories: store.getTopCategories,

      // Presupuestos
      updateBudget: store.updateCategoryBudget,
      getOverBudget: store.getCategoriesOverBudget,

      // ML y sugerencias
      predictCategory: store.predictCategory,
      addKeyword: store.addKeywordToCategory,
      removeKeyword: store.removeKeywordFromCategory,

      // Utilidades
      initDefaults: store.initializeDefaultCategories,
      resetToDefaults: store.resetToDefaults
    }),
    [store]
  )
}

/**
 * Hook especializado para búsqueda inteligente de categorías
 */
export const useCategorySearch = (query: string, filters?: CategoryFilter) => {
  const { search, categories } = useCategories()

  return useMemo(() => {
    let results = categories

    // Aplicar búsqueda por texto
    if (query.trim()) {
      results = search(query)
    }

    // Aplicar filtros adicionales
    if (filters) {
      results = results.filter((category) => {
        if (
          filters.name &&
          !category.name.toLowerCase().includes(filters.name.toLowerCase())
        ) {
          return false
        }
        if (
          filters.minBudget &&
          (!category.budget || category.budget < filters.minBudget)
        ) {
          return false
        }
        if (
          filters.maxBudget &&
          (!category.budget || category.budget > filters.maxBudget)
        ) {
          return false
        }
        if (
          filters.isActive !== undefined &&
          category.isActive !== filters.isActive
        ) {
          return false
        }
        return true
      })
    }

    return results
  }, [query, filters, search, categories])
}

/**
 * Hook para predicción de categorías usando ML
 */
export const useCategoryPrediction = () => {
  const { predictCategory } = useCategories()

  const getPrediction = (
    description: string,
    amount?: number
  ): MLCategoryPrediction[] => {
    return predictCategory(description, amount)
  }

  const getBestMatch = (
    description: string,
    amount?: number
  ): ExpenseCategory | null => {
    const predictions = getPrediction(description, amount)
    const { getCategoryById } = useCategoryStore.getState()

    if (predictions.length > 0 && predictions[0].confidence > 0.3) {
      return getCategoryById(predictions[0].categoryId) || null
    }

    return null
  }

  const getSuggestions = (
    description: string,
    amount?: number,
    limit = 3
  ): ExpenseCategory[] => {
    const predictions = getPrediction(description, amount)
    const { getCategoryById } = useCategoryStore.getState()

    return predictions
      .filter((pred) => pred.confidence > 0.1)
      .slice(0, limit)
      .map((pred) => getCategoryById(pred.categoryId))
      .filter(Boolean) as ExpenseCategory[]
  }

  return {
    getPrediction,
    getBestMatch,
    getSuggestions
  }
}

/**
 * Hook para gestión de presupuestos por categoría
 */
export const useCategoryBudgets = () => {
  const { categories, updateBudget, getOverBudget, getStats } = useCategories()

  const getBudgetStatus = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    const stats = getStats(categoryId)

    if (!category || !category.budget || !stats) {
      return null
    }

    return {
      categoryId,
      budget: category.budget,
      spent: stats.totalSpent,
      remaining: category.budget - stats.totalSpent,
      percentage: (stats.totalSpent / category.budget) * 100,
      isOverBudget: stats.totalSpent > category.budget
    }
  }

  const getAllBudgetStatuses = () => {
    return categories
      .filter((cat) => cat.budget && cat.isActive)
      .map((cat) => getBudgetStatus(cat.id))
      .filter(Boolean)
  }

  const getOverBudgetCategories = () => {
    return getOverBudget()
  }

  const updateCategoryBudget = (categoryId: string, budget: number) => {
    updateBudget(categoryId, budget)
  }

  return {
    getBudgetStatus,
    getAllBudgetStatuses,
    getOverBudgetCategories,
    updateCategoryBudget
  }
}

/**
 * Hook para estadísticas avanzadas de categorías
 */
export const useCategoryAnalytics = () => {
  const { categories, categoryStats, getTopCategories } = useCategories()

  const getTrendingCategories = (
    period: 'week' | 'month' | 'year' = 'month'
  ) => {
    return categoryStats
      .filter((stat) => stat.monthlyTrend > 0)
      .sort((a, b) => b.monthlyTrend - a.monthlyTrend)
      .slice(0, 5)
      .map((stat) => categories.find((cat) => cat.id === stat.categoryId))
      .filter(Boolean) as ExpenseCategory[]
  }

  const getUnusedCategories = () => {
    const usedCategoryIds = categoryStats.map((stat) => stat.categoryId)
    return categories.filter(
      (cat) => cat.isActive && !usedCategoryIds.includes(cat.id)
    )
  }

  const getCategoryDistribution = () => {
    const totalSpent = categoryStats.reduce(
      (sum, stat) => sum + stat.totalSpent,
      0
    )

    return categoryStats
      .map((stat) => {
        const category = categories.find((cat) => cat.id === stat.categoryId)
        return {
          category,
          amount: stat.totalSpent,
          percentage: totalSpent > 0 ? (stat.totalSpent / totalSpent) * 100 : 0,
          transactionCount: stat.transactionCount
        }
      })
      .filter((item) => item.category)
  }

  return {
    getTrendingCategories,
    getUnusedCategories,
    getCategoryDistribution,
    getTopCategories
  }
}
