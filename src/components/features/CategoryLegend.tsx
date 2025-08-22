import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ExpenseCategory } from '../types/expense'
import { Icon, categoryIcons } from './Icon'

interface CategoryLegendProps {
  categories: ExpenseCategory[]
  variant?: 'default' | 'compact' | 'detailed'
  showIcons?: boolean
  className?: string
  onCategoryPress?: (category: ExpenseCategory) => void
}

interface CategoryItemProps {
  category: ExpenseCategory
  variant: 'default' | 'compact' | 'detailed'
  showIcons: boolean
  onPress?: (category: ExpenseCategory) => void
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  variant,
  showIcons,
  onPress
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          item: 'flex-row items-center py-1 px-2 bg-gray-800 rounded-md min-w-16',
          indicator: 'w-2 h-2 rounded-full mr-2',
          label: 'text-white text-xs font-medium',
          emoji: 'text-xs ml-1'
        }
      case 'detailed':
        return {
          item: 'flex-row items-center justify-between py-3 px-4 bg-gray-800 rounded-xl border border-gray-700',
          indicator: 'w-3 h-3 rounded-full mr-3',
          label: 'text-white text-sm font-semibold flex-1',
          emoji: 'text-base ml-2'
        }
      default:
        return {
          item: 'flex-row items-center py-2 px-3 bg-gray-800 rounded-lg min-w-20',
          indicator: 'w-2.5 h-2.5 rounded-full mr-2.5',
          label: 'text-white text-xs font-medium mr-1',
          emoji: 'text-sm'
        }
    }
  }

  const styles = getVariantStyles()
  const categoryKey = category.name.toLowerCase().replace(' ', '-')
  const iconConfig = categoryIcons[categoryKey] || categoryIcons.other

  const Component = onPress ? TouchableOpacity : View

  return (
    <Component
      className={styles.item}
      onPress={onPress ? () => onPress(category) : undefined}>
      <View
        className={styles.indicator}
        style={{ backgroundColor: category.color }}
      />

      {showIcons && variant === 'detailed' && (
        <Icon
          name={iconConfig.icon}
          size={16}
          color={category.color}
          className='mr-2'
        />
      )}

      <Text className={styles.label}>{category.name}</Text>
      <Text className={styles.emoji}>{category.icon}</Text>
    </Component>
  )
}

export const CategoryLegend: React.FC<CategoryLegendProps> = ({
  categories,
  variant = 'default',
  showIcons = true,
  className = '',
  onCategoryPress
}) => {
  const getContainerStyles = () => {
    switch (variant) {
      case 'compact':
        return 'flex-row flex-wrap gap-2 p-3'
      case 'detailed':
        return 'flex-col gap-3 p-4'
      default:
        return 'flex-row flex-wrap gap-3 p-4'
    }
  }

  return (
    <View className={`${getContainerStyles()} ${className}`}>
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          variant={variant}
          showIcons={showIcons}
          onPress={onCategoryPress}
        />
      ))}
    </View>
  )
}
