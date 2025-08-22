import {
  Bell,
  BookOpen,
  Calendar,
  Car,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  LogOut,
  LucideIcon,
  Mail,
  MoreHorizontal,
  Paperclip,
  Receipt,
  Shield,
  ShoppingBag,
  Star,
  Users,
  Utensils,
  X
} from 'lucide-react-native'
import React from 'react'
import { View } from 'react-native'

export interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
}

export type IconName =
  | 'utensils'
  | 'shopping-bag'
  | 'car'
  | 'star'
  | 'book-open'
  | 'more-horizontal'
  | 'chevron-right'
  | 'check'
  | 'x'
  | 'calendar'
  | 'paperclip'
  | 'receipt'
  | 'mail'
  | 'lock-closed'
  | 'eye'
  | 'eye-slash'
  | 'users'
  | 'bell'
  | 'shield'
  | 'help-circle'
  | 'log-out'

const iconMap: Record<IconName, LucideIcon> = {
  utensils: Utensils,
  'shopping-bag': ShoppingBag,
  car: Car,
  star: Star,
  'book-open': BookOpen,
  'more-horizontal': MoreHorizontal,
  'chevron-right': ChevronRight,
  check: Check,
  x: X,
  calendar: Calendar,
  paperclip: Paperclip,
  receipt: Receipt,
  mail: Mail,
  'lock-closed': Lock,
  eye: Eye,
  'eye-slash': EyeOff,
  users: Users,
  bell: Bell,
  shield: Shield,
  'help-circle': HelpCircle,
  'log-out': LogOut
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#FFFFFF',
  className = ''
}) => {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <View className={className}>
      <IconComponent size={size} color={color} />
    </View>
  )
}

// Mapa de categorías con iconos
export const categoryIcons: Record<string, { icon: IconName; emoji: string }> =
  {
    food: { icon: 'utensils', emoji: '🍕' },
    shopping: { icon: 'shopping-bag', emoji: '🛍️' },
    transport: { icon: 'car', emoji: '🚗' },
    health: { icon: 'star', emoji: '💪' },
    education: { icon: 'book-open', emoji: '📚' },
    other: { icon: 'more-horizontal', emoji: '⚪' }
  }
