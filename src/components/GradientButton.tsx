import React from 'react'
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'

interface GradientButtonProps extends TouchableOpacityProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onPress,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseClasses = 'rounded-2xl items-center justify-center shadow-button'

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-purple to-primary-blue',
    secondary: 'bg-gray-800',
    outline: 'border-2 border-primary-purple bg-transparent'
  }

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-5'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-body-lg',
    lg: 'text-lg'
  }

  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-purple'
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}>
      <Text
        className={`font-sf-pro ${textSizeClasses[size]} font-semibold text-center ${textColorClasses[variant]}`}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
