import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface CategoryLegendProps {
  icon: string
  label: string
  color: string
  onPress?: () => void
}

export const CategoryLegend: React.FC<CategoryLegendProps> = ({
  icon,
  label,
  color,
  onPress
}) => {
  const Component = onPress ? TouchableOpacity : View

  return (
    <Component
      onPress={onPress}
      className='flex-row items-center m-1 px-3 py-2 rounded-lg bg-gray-800'>
      <View className={`w-3 h-3 rounded-full mr-2 ${color}`} />
      <Text className='text-white font-sf-pro text-caption mr-1'>{icon}</Text>
      <Text className='text-white font-sf-pro text-caption'>{label}</Text>
    </Component>
  )
}
