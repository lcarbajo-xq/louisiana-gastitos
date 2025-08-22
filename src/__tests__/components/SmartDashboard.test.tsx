import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'
import { SmartDashboard } from '../../components/SmartDashboard'
import { useAdvancedFeatures } from '../../hooks/useAdvancedFeatures'

// Mock the custom hook
jest.mock('../../hooks/useAdvancedFeatures')
const mockUseAdvancedFeatures = useAdvancedFeatures as jest.MockedFunction<
  typeof useAdvancedFeatures
>

// Mock react-native-svg components
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Text: 'Text',
  G: 'G'
}))

// Mock Victory charts
jest.mock('victory-native', () => ({
  VictoryPie: ({ data, colorScale, ...props }: any) => {
    return React.createElement('VictoryPie', {
      testID: 'victory-pie',
      'data-testid': 'victory-pie',
      ...props
    })
  }
}))

describe('SmartDashboard', () => {
  const mockAdvancedFeatures = {
    analyzeSpendingPatterns: jest.fn(),
    generateSmartRecommendations: jest.fn(),
    detectUnusualSpending: jest.fn(),
    setupSmartBudget: jest.fn(),
    exportData: jest.fn(),
    getOverallFinancialHealth: jest.fn(),
    loading: false,
    error: null
  }

  beforeEach(() => {
    mockUseAdvancedFeatures.mockReturnValue(mockAdvancedFeatures)
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render dashboard title', () => {
      const { getByText } = render(<SmartDashboard />)

      expect(getByText('Smart Dashboard')).toBeTruthy()
    })

    it('should render financial health score section', () => {
      mockAdvancedFeatures.getOverallFinancialHealth.mockReturnValue({
        score: 85,
        status: 'good' as const,
        breakdown: {
          budgetHealth: 90,
          savingsProgress: 80,
          spendingConsistency: 85
        },
        insights: ['Great budget management!']
      })

      const { getByText } = render(<SmartDashboard />)

      expect(getByText('Financial Health Score')).toBeTruthy()
      expect(getByText('85')).toBeTruthy()
      expect(getByText('Good')).toBeTruthy()
    })

    it('should render quick actions section', () => {
      const { getByText } = render(<SmartDashboard />)

      expect(getByText('Quick Actions')).toBeTruthy()
      expect(getByText('Setup Smart Budget')).toBeTruthy()
      expect(getByText('Analyze Patterns')).toBeTruthy()
      expect(getByText('Export Data')).toBeTruthy()
    })

    it('should show loading state', () => {
      mockUseAdvancedFeatures.mockReturnValue({
        ...mockAdvancedFeatures,
        loading: true
      })

      const { getByText } = render(<SmartDashboard />)

      expect(getByText('Loading...')).toBeTruthy()
    })

    it('should show error state', () => {
      mockUseAdvancedFeatures.mockReturnValue({
        ...mockAdvancedFeatures,
        error: 'Failed to load data'
      })

      const { getByText } = render(<SmartDashboard />)

      expect(getByText('Error: Failed to load data')).toBeTruthy()
    })
  })

  describe('User Interactions', () => {
    it('should handle setup smart budget action', async () => {
      mockAdvancedFeatures.setupSmartBudget.mockResolvedValue(undefined)

      const { getByText } = render(<SmartDashboard />)

      fireEvent.press(getByText('Setup Smart Budget'))

      await waitFor(() => {
        expect(mockAdvancedFeatures.setupSmartBudget).toHaveBeenCalled()
      })
    })

    it('should handle analyze patterns action', async () => {
      mockAdvancedFeatures.analyzeSpendingPatterns.mockResolvedValue([])

      const { getByText } = render(<SmartDashboard />)

      fireEvent.press(getByText('Analyze Patterns'))

      await waitFor(() => {
        expect(mockAdvancedFeatures.analyzeSpendingPatterns).toHaveBeenCalled()
      })
    })

    it('should handle export data action', async () => {
      mockAdvancedFeatures.exportData.mockResolvedValue({
        success: true,
        filePath: '/path/to/file'
      })

      const { getByText } = render(<SmartDashboard />)

      fireEvent.press(getByText('Export Data'))

      await waitFor(() => {
        expect(mockAdvancedFeatures.exportData).toHaveBeenCalled()
      })
    })

    it('should refresh data on pull to refresh', async () => {
      const { getByTestId } = render(<SmartDashboard />)

      const scrollView = getByTestId('smart-dashboard-scroll')
      fireEvent(scrollView, 'refresh')

      await waitFor(() => {
        expect(
          mockAdvancedFeatures.getOverallFinancialHealth
        ).toHaveBeenCalled()
      })
    })
  })

  describe('Financial Health Score', () => {
    it('should display score with correct color for excellent health', () => {
      mockAdvancedFeatures.getOverallFinancialHealth.mockReturnValue({
        score: 95,
        status: 'excellent' as const,
        breakdown: {
          budgetHealth: 95,
          savingsProgress: 95,
          spendingConsistency: 95
        },
        insights: ['Excellent financial management!']
      })

      const { getByText } = render(<SmartDashboard />)

      expect(getByText('95')).toBeTruthy()
      expect(getByText('Excellent')).toBeTruthy()
    })

    it('should display score with correct color for poor health', () => {
      mockAdvancedFeatures.getOverallFinancialHealth.mockReturnValue({
        score: 45,
        status: 'poor' as const,
        breakdown: {
          budgetHealth: 40,
          savingsProgress: 50,
          spendingConsistency: 45
        },
        insights: ['Consider reviewing your spending habits']
      })

      const { getByText } = render(<SmartDashboard />)

      expect(getByText('45')).toBeTruthy()
      expect(getByText('Poor')).toBeTruthy()
    })

    it('should show breakdown components', () => {
      mockAdvancedFeatures.getOverallFinancialHealth.mockReturnValue({
        score: 80,
        status: 'good' as const,
        breakdown: {
          budgetHealth: 85,
          savingsProgress: 75,
          spendingConsistency: 80
        },
        insights: ['Good financial health overall']
      })

      const { getByText } = render(<SmartDashboard />)

      expect(getByText('Budget Health: 85%')).toBeTruthy()
      expect(getByText('Savings Progress: 75%')).toBeTruthy()
      expect(getByText('Spending Consistency: 80%')).toBeTruthy()
    })
  })

  describe('Recommendations Section', () => {
    it('should display smart recommendations', async () => {
      mockAdvancedFeatures.generateSmartRecommendations.mockResolvedValue([
        'Consider reducing food expenses by 20%',
        'Set up automatic savings for better financial health'
      ])

      const { getByText } = render(<SmartDashboard />)

      await waitFor(() => {
        expect(getByText('Smart Recommendations')).toBeTruthy()
      })
    })

    it('should show no recommendations message when empty', async () => {
      mockAdvancedFeatures.generateSmartRecommendations.mockResolvedValue([])

      const { getByText } = render(<SmartDashboard />)

      await waitFor(() => {
        expect(getByText('No recommendations at this time')).toBeTruthy()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<SmartDashboard />)

      expect(getByLabelText('Financial Health Score')).toBeTruthy()
    })

    it('should have accessible buttons', () => {
      const { getByRole } = render(<SmartDashboard />)

      expect(getByRole('button', { name: 'Setup Smart Budget' })).toBeTruthy()
      expect(getByRole('button', { name: 'Analyze Patterns' })).toBeTruthy()
      expect(getByRole('button', { name: 'Export Data' })).toBeTruthy()
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn()

      const TestComponent = () => {
        renderSpy()
        return <SmartDashboard />
      }

      const { rerender } = render(<TestComponent />)

      // Re-render with same props
      rerender(<TestComponent />)

      expect(renderSpy).toHaveBeenCalledTimes(2) // Initial + re-render
    })

    it('should handle large datasets efficiently', () => {
      const largeHealthData = {
        score: 85,
        status: 'good' as const,
        breakdown: {
          budgetHealth: 90,
          savingsProgress: 80,
          spendingConsistency: 85
        },
        insights: Array.from({ length: 100 }, (_, i) => `Insight ${i}`)
      }

      mockAdvancedFeatures.getOverallFinancialHealth.mockReturnValue(
        largeHealthData
      )

      expect(() => {
        render(<SmartDashboard />)
      }).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle hook errors gracefully', () => {
      mockUseAdvancedFeatures.mockReturnValue({
        ...mockAdvancedFeatures,
        error: 'Network error'
      })

      const { getByText } = render(<SmartDashboard />)

      expect(getByText('Error: Network error')).toBeTruthy()
    })

    it('should handle undefined health data', () => {
      mockAdvancedFeatures.getOverallFinancialHealth.mockReturnValue(undefined)

      expect(() => {
        render(<SmartDashboard />)
      }).not.toThrow()
    })

    it('should handle failed async operations', async () => {
      mockAdvancedFeatures.setupSmartBudget.mockRejectedValue(
        new Error('Setup failed')
      )

      const { getByText } = render(<SmartDashboard />)

      fireEvent.press(getByText('Setup Smart Budget'))

      await waitFor(() => {
        expect(getByText('Failed to setup smart budget')).toBeTruthy()
      })
    })
  })
})
