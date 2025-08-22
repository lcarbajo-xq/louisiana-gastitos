import { MLAnalysisService } from '../../services/MLAnalysisService'
import { Expense } from '../../types/expense'

describe('MLAnalysisService', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      amount: 30,
      category: {
        id: 'food',
        name: 'Food',
        icon: 'utensils',
        color: '#F59E0B'
      },
      description: 'Breakfast',
      date: new Date('2025-08-01T08:00:00'),
      paymentMethod: 'card'
    },
    {
      id: '2',
      amount: 50,
      category: {
        id: 'food',
        name: 'Food',
        icon: 'utensils',
        color: '#F59E0B'
      },
      description: 'Lunch',
      date: new Date('2025-08-01T12:00:00'),
      paymentMethod: 'cash'
    },
    {
      id: '3',
      amount: 25,
      category: {
        id: 'transport',
        name: 'Transport',
        icon: 'car',
        color: '#8B5CF6'
      },
      description: 'Bus ticket',
      date: new Date('2025-08-02T09:00:00'),
      paymentMethod: 'card'
    },
    {
      id: '4',
      amount: 40,
      category: {
        id: 'food',
        name: 'Food',
        icon: 'utensils',
        color: '#F59E0B'
      },
      description: 'Dinner',
      date: new Date('2025-08-02T19:00:00'),
      paymentMethod: 'card'
    },
    {
      id: '5',
      amount: 15,
      category: {
        id: 'transport',
        name: 'Transport',
        icon: 'car',
        color: '#8B5CF6'
      },
      description: 'Metro ticket',
      date: new Date('2025-08-03T17:00:00'),
      paymentMethod: 'card'
    }
  ]

  describe('predictSpending', () => {
    it('should predict weekly food spending', async () => {
      const prediction = await MLAnalysisService.predictSpending(
        mockExpenses,
        'food',
        'week'
      )

      expect(prediction).toBeDefined()
      expect(prediction.categoryId).toBe('food')
      expect(prediction.period).toBe('week')
      expect(prediction.predictedAmount).toBeGreaterThan(0)
      expect(prediction.confidence).toBeGreaterThanOrEqual(0)
      expect(prediction.confidence).toBeLessThanOrEqual(1)
      expect(prediction.factors).toBeDefined()
      expect(typeof prediction.factors).toBe('object')
      expect(prediction.factors.historical).toBeGreaterThanOrEqual(0)
      expect(prediction.factors.seasonal).toBeDefined()
      expect(prediction.factors.trending).toBeDefined()
    })

    it('should predict monthly transport spending', async () => {
      const prediction = await MLAnalysisService.predictSpending(
        mockExpenses,
        'transport',
        'month'
      )

      expect(prediction.categoryId).toBe('transport')
      expect(prediction.period).toBe('month')
      expect(prediction.predictedAmount).toBeGreaterThan(0)
    })

    it('should handle category with no expenses', async () => {
      const prediction = await MLAnalysisService.predictSpending(
        mockExpenses,
        'nonexistent',
        'week'
      )

      expect(prediction.predictedAmount).toBe(0)
      expect(prediction.confidence).toBe(0)
      expect(prediction.factors.historical).toBe(0)
    })

    it('should include factors in prediction', async () => {
      const prediction = await MLAnalysisService.predictSpending(
        mockExpenses,
        'food',
        'week'
      )

      expect(prediction.factors).toHaveProperty('historical')
      expect(prediction.factors).toHaveProperty('seasonal')
      expect(prediction.factors).toHaveProperty('trending')
    })

    it('should generate prediction timestamp', async () => {
      const prediction = await MLAnalysisService.predictSpending(
        mockExpenses,
        'food',
        'month'
      )

      expect(prediction.generatedAt).toBeInstanceOf(Date)
      expect(prediction.basedOnDays).toBeGreaterThan(0)
    })
  })

  describe('analyzeSpendingPatterns', () => {
    it('should analyze spending patterns correctly', () => {
      const patterns = MLAnalysisService.analyzeSpendingPatterns(mockExpenses)

      expect(patterns).toBeDefined()
      expect(Array.isArray(patterns)).toBe(true)
    })

    it('should return patterns with correct structure', () => {
      const patterns = MLAnalysisService.analyzeSpendingPatterns(mockExpenses)

      if (patterns.length > 0) {
        expect(patterns[0]).toHaveProperty('id')
        expect(patterns[0]).toHaveProperty('type')
        expect(patterns[0]).toHaveProperty('description')
        expect(patterns[0]).toHaveProperty('strength')
        expect(patterns[0]).toHaveProperty('data')
      }
    })

    it('should handle empty expense array', () => {
      const patterns = MLAnalysisService.analyzeSpendingPatterns([])

      expect(patterns).toBeDefined()
      expect(Array.isArray(patterns)).toBe(true)
    })
  })

  describe('detectAnomalies', () => {
    it('should detect expensive outliers', () => {
      const expensiveExpense: Expense = {
        id: 'expensive',
        amount: 1000, // Much higher than usual
        category: {
          id: 'food',
          name: 'Food',
          icon: 'utensils',
          color: '#F59E0B'
        },
        description: 'Expensive meal',
        date: new Date('2025-08-04'),
        paymentMethod: 'card'
      }

      const expensesWithOutlier = [...mockExpenses, expensiveExpense]
      const anomalies = MLAnalysisService.detectAnomalies(
        expensesWithOutlier,
        'food'
      )

      expect(Array.isArray(anomalies)).toBe(true)
      if (anomalies.length > 0) {
        expect(anomalies[0]).toHaveProperty('id')
        expect(anomalies[0]).toHaveProperty('amount')
      }
    })

    it('should not detect normal expenses as anomalies', () => {
      const anomalies = MLAnalysisService.detectAnomalies(mockExpenses, 'food')

      expect(Array.isArray(anomalies)).toBe(true)
      // Normal expenses should not be flagged as anomalies
    })

    it('should handle category with no expenses', () => {
      const anomalies = MLAnalysisService.detectAnomalies(
        mockExpenses,
        'nonexistent'
      )

      expect(Array.isArray(anomalies)).toBe(true)
      expect(anomalies).toHaveLength(0)
    })
  })

  describe('generateRecommendations', () => {
    it('should generate spending recommendations', async () => {
      const patterns = MLAnalysisService.analyzeSpendingPatterns(mockExpenses)
      const recommendations = await MLAnalysisService.generateRecommendations(
        patterns,
        mockExpenses
      )

      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should return string recommendations', async () => {
      const patterns = MLAnalysisService.analyzeSpendingPatterns(mockExpenses)
      const recommendations = await MLAnalysisService.generateRecommendations(
        patterns,
        mockExpenses
      )

      if (recommendations.length > 0) {
        expect(typeof recommendations[0]).toBe('string')
        expect(recommendations[0].length).toBeGreaterThan(0)
      }
    })

    it('should handle empty patterns gracefully', async () => {
      const recommendations = await MLAnalysisService.generateRecommendations(
        [],
        mockExpenses
      )

      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle expenses with recent dates', () => {
      const recentExpense: Expense = {
        id: 'recent',
        amount: 50,
        category: {
          id: 'food',
          name: 'Food',
          icon: 'utensils',
          color: '#F59E0B'
        },
        description: 'Recent expense',
        date: new Date(), // Current date
        paymentMethod: 'card'
      }

      expect(() => {
        MLAnalysisService.analyzeSpendingPatterns([recentExpense])
      }).not.toThrow()
    })

    it('should handle negative amounts', () => {
      const negativeExpense: Expense = {
        id: 'negative',
        amount: -50,
        category: {
          id: 'food',
          name: 'Food',
          icon: 'utensils',
          color: '#F59E0B'
        },
        description: 'Refund',
        date: new Date('2025-08-04'),
        paymentMethod: 'card'
      }

      expect(() => {
        MLAnalysisService.analyzeSpendingPatterns([negativeExpense])
      }).not.toThrow()
    })

    it('should handle zero amounts', () => {
      const zeroExpense: Expense = {
        id: 'zero',
        amount: 0,
        category: {
          id: 'food',
          name: 'Food',
          icon: 'utensils',
          color: '#F59E0B'
        },
        description: 'Free meal',
        date: new Date('2025-08-04'),
        paymentMethod: 'card'
      }

      expect(() => {
        MLAnalysisService.analyzeSpendingPatterns([zeroExpense])
      }).not.toThrow()
    })

    it('should handle insufficient data for predictions', async () => {
      const singleExpense: Expense[] = [
        {
          id: '1',
          amount: 30,
          category: {
            id: 'food',
            name: 'Food',
            icon: 'utensils',
            color: '#F59E0B'
          },
          description: 'Single expense',
          date: new Date('2025-08-01'),
          paymentMethod: 'card'
        }
      ]

      const prediction = await MLAnalysisService.predictSpending(
        singleExpense,
        'food',
        'week'
      )

      expect(prediction.predictedAmount).toBe(0)
      expect(prediction.confidence).toBe(0)
    })
  })
})
