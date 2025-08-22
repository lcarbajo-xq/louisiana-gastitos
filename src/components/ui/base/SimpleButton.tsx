import React from 'react'
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native'

interface SimpleButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle = [styles.button, styles[size] as ViewStyle]

    if (disabled) {
      baseStyle.push(styles.disabled as ViewStyle)
    } else {
      baseStyle.push(styles[variant] as ViewStyle)
    }

    return baseStyle
  }

  const getTextStyle = (): TextStyle[] => {
    const baseStyle = [
      styles.text,
      styles[`${size}Text` as keyof typeof styles] as TextStyle
    ]

    if (variant === 'outline') {
      baseStyle.push(styles.outlineText as TextStyle)
    } else {
      baseStyle.push(styles.solidText as TextStyle)
    }

    return baseStyle
  }

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      <Text style={getTextStyle()}>{loading ? 'Cargando...' : title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },

  // Variants
  primary: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6'
  },
  secondary: {
    backgroundColor: '#374151',
    borderColor: '#374151'
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#3B82F6'
  },
  disabled: {
    backgroundColor: '#4B5563',
    borderColor: '#4B5563'
  },

  // Sizes
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 40
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 48
  },

  // Text styles
  text: {
    fontWeight: '600'
  },
  solidText: {
    color: '#FFFFFF'
  },
  outlineText: {
    color: '#3B82F6'
  },
  smText: {
    fontSize: 14
  },
  mdText: {
    fontSize: 16
  },
  lgText: {
    fontSize: 18
  }
})
