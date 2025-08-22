import React from 'react'
import { View, ViewProps } from 'react-native'

interface ExpenseCardProps extends ViewProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient'
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const baseClasses = 'rounded-2xl p-4'

  const variantClasses = {
    default: 'bg-gray-800 shadow-card',
    elevated: 'bg-gray-800 shadow-button',
    outlined: 'bg-transparent border border-gray-700',
    gradient: 'bg-gradient-to-br from-card-start to-card-end shadow-card'
  }

  return (
    <View
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}>
      {children}
    </View>
  )
}
