import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, renderHook } from '@testing-library/react-native'
import { useExpenseStore } from '../../store/expenseStore'
import { Expense, ExpenseCategory } from '../../types/expense'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage')

describe('useExpenseStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    AsyncStorage.clear()

    // Reset store state
    useExpenseStore.getState().expenses = []
    useExpenseStore.getState().categories = []
  })

  describe('Expense Management', () => {
    const mockExpense: Omit<Expense, 'id'> = {
      amount: 50.0,
      category: {
        id: 'food',
        name: 'Food',
        icon: 'utensils',
        color: '#F59E0B'
      },
      description: 'Lunch at restaurant',
      date: new Date('2025-08-12T12:00:00.000Z'),
      paymentMethod: 'card'
    }

    it('should add expense successfully', async () => {
      const { result } = renderHook(() => useExpenseStore())

      await act(async () => {
        result.current.addExpense(mockExpense)
      })

      const expenses = result.current.expenses
      expect(expenses).toHaveLength(1)
      expect(expenses[0]).toMatchObject({
        ...mockExpense,
        id: expect.any(String)
      })
      expect(expenses[0].id).toBeDefined()
    })

    it('should update expense successfully', async () => {
      const { result } = renderHook(() => useExpenseStore())

      // Add expense first
      let expenseId: string
      await act(async () => {
        result.current.addExpense(mockExpense)
        expenseId = result.current.expenses[0].id
      })

      // Update expense
      const updateData = { description: 'Updated description' }
      await act(async () => {
        result.current.updateExpense(expenseId, updateData)
      })

      const updatedExpense = result.current.expenses.find(
        (e) => e.id === expenseId
      )
      expect(updatedExpense?.description).toBe('Updated description')
      expect(updatedExpense?.amount).toBe(mockExpense.amount) // Other fields unchanged
    })

    it('should delete expense successfully', async () => {
      const { result } = renderHook(() => useExpenseStore())

      // Add expense first
      let expenseId: string
      await act(async () => {
        result.current.addExpense(mockExpense)
        expenseId = result.current.expenses[0].id
      })

      expect(result.current.expenses).toHaveLength(1)

      // Delete expense
      await act(async () => {
        result.current.deleteExpense(expenseId)
      })

      expect(result.current.expenses).toHaveLength(0)
    })

    it('should not delete non-existent expense', async () => {
      const { result } = renderHook(() => useExpenseStore())

      await act(async () => {
        result.current.addExpense(mockExpense)
      })

      const initialLength = result.current.expenses.length

      await act(async () => {
        result.current.deleteExpense('non-existent-id')
      })

      expect(result.current.expenses).toHaveLength(initialLength)
    })
  })

  describe('Category Management', () => {
    const mockCategory: Omit<ExpenseCategory, 'id'> = {
      name: 'Custom Category',
      icon: 'star',
      color: '#8B5CF6',
      budget: 100
    }

    it('should add category successfully', async () => {
      const { result } = renderHook(() => useExpenseStore())

      await act(async () => {
        result.current.addCategory(mockCategory)
      })

      const categories = result.current.categories
      expect(categories).toHaveLength(1)
      expect(categories[0]).toMatchObject({
        ...mockCategory,
        id: expect.any(String)
      })
    })

    it('should get default categories', async () => {
      const { result } = renderHook(() => useExpenseStore())

      const defaultCategories = result.current.getDefaultCategories()

      expect(defaultCategories).toHaveLength(6)
      expect(defaultCategories.map((c) => c.name)).toEqual([
        'Food',
        'Shopping',
        'Transport',
        'Health & Fitness',
        'Education',
        'Other'
      ])
    })
  })

  describe('Query Methods', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useExpenseStore())

      const foodCategory: ExpenseCategory = {
        id: 'food',
        name: 'Food',
        icon: 'utensils',
        color: '#F59E0B'
      }

      const transportCategory: ExpenseCategory = {
        id: 'transport',
        name: 'Transport',
        icon: 'car',
        color: '#8B5CF6'
      }

      const expenses = [
        {
          amount: 30,
          category: foodCategory,
          description: 'Breakfast',
          date: new Date('2025-08-10'),
          paymentMethod: 'cash' as const
        },
        {
          amount: 15,
          category: transportCategory,
          description: 'Bus ticket',
          date: new Date('2025-08-11'),
          paymentMethod: 'card' as const
        },
        {
          amount: 25,
          category: foodCategory,
          description: 'Lunch',
          date: new Date('2025-08-12'),
          paymentMethod: 'card' as const
        }
      ]

      await act(async () => {
        expenses.forEach((expense) => {
          result.current.addExpense(expense)
        })
      })
    })

    it('should get expenses by category', async () => {
      const { result } = renderHook(() => useExpenseStore())

      const foodExpenses = result.current.getExpensesByCategory('food')
      const transportExpenses =
        result.current.getExpensesByCategory('transport')

      expect(foodExpenses).toHaveLength(2)
      expect(transportExpenses).toHaveLength(1)

      expect(foodExpenses.every((e) => e.category.id === 'food')).toBe(true)
      expect(
        transportExpenses.every((e) => e.category.id === 'transport')
      ).toBe(true)
    })

    it('should get expenses by date range', async () => {
      const { result } = renderHook(() => useExpenseStore())

      const startDate = new Date('2025-08-11')
      const endDate = new Date('2025-08-12')

      const expensesInRange = result.current.getExpensesByDateRange(
        startDate,
        endDate
      )

      expect(expensesInRange).toHaveLength(2)
      expect(expensesInRange.map((e) => e.description)).toEqual([
        'Bus ticket',
        'Lunch'
      ])
    })
  })

  describe('Persistence', () => {
    it('should persist expenses to AsyncStorage', async () => {
      const { result } = renderHook(() => useExpenseStore())

      await act(async () => {
        result.current.addExpense({
          amount: 50,
          category: {
            id: 'food',
            name: 'Food',
            icon: 'utensils',
            color: '#F59E0B'
          },
          description: 'Test expense',
          date: new Date(),
          paymentMethod: 'card'
        })
      })

      // Verify AsyncStorage was called
      expect(AsyncStorage.setItem).toHaveBeenCalled()
    })

    it('should load expenses from AsyncStorage on initialization', async () => {
      const mockStoredData = {
        state: {
          expenses: [
            {
              id: '1',
              amount: 75,
              category: {
                id: 'food',
                name: 'Food',
                icon: 'utensils',
                color: '#F59E0B'
              },
              description: 'Stored expense',
              date: '2025-08-12T00:00:00.000Z',
              paymentMethod: 'cash'
            }
          ]
        },
        version: 0
      }

      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockStoredData)
      )

      const { result } = renderHook(() => useExpenseStore())

      // Wait for hydration
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })

      expect(result.current.expenses).toHaveLength(1)
      expect(result.current.expenses[0].description).toBe('Stored expense')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid expense data gracefully', async () => {
      const { result } = renderHook(() => useExpenseStore())

      const invalidExpense = {
        // Missing required fields
        amount: -50, // Invalid amount
        category: null,
        description: '',
        date: 'invalid-date'
      } as any

      await act(async () => {
        expect(() => {
          result.current.addExpense(invalidExpense)
        }).not.toThrow()
      })

      // Should not add invalid expense
      expect(result.current.expenses).toHaveLength(0)
    })

    it('should handle AsyncStorage errors gracefully', async () => {
      ;(AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      )

      const { result } = renderHook(() => useExpenseStore())

      await act(async () => {
        expect(() => {
          result.current.addExpense({
            amount: 50,
            category: {
              id: 'food',
              name: 'Food',
              icon: 'utensils',
              color: '#F59E0B'
            },
            description: 'Test expense',
            date: new Date(),
            paymentMethod: 'card'
          })
        }).not.toThrow()
      })

      // Should still add expense despite storage error
      expect(result.current.expenses).toHaveLength(1)
    })
  })
})
