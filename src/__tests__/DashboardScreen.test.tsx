import { render, screen } from '@testing-library/react-native'
import React from 'react'
import { DashboardScreen } from '../screens/DashboardScreen'

// Mock navigation and route are not needed since DashboardScreen doesn't use them

describe('DashboardScreen', () => {
  it('renders dashboard screen correctly', () => {
    render(<DashboardScreen />)

    // Verify basic UI elements are present
    expect(screen.getByText('Expenses')).toBeTruthy()
  })

  it('displays month selector', () => {
    render(<DashboardScreen />)

    // Verify month selector is displayed
    expect(screen.getByText('June')).toBeTruthy()
  })

  it('renders expense summary section', () => {
    render(<DashboardScreen />)

    // Should render the basic structure
    expect(screen.getByText('Expenses')).toBeTruthy()
  })
})
