import React from 'react';
import { View } from 'react-native';
import {
  Utensils,
  ShoppingBag,
  Car,
  Star,
  BookOpen,
  MoreHorizontal,
  ChevronRight,
  Check,
  X,
  Calendar,
  Paperclip,
  LucideIcon,
} from 'lucide-react-native';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
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
  | 'paperclip';

const iconMap: Record<IconName, LucideIcon> = {
  'utensils': Utensils,
  'shopping-bag': ShoppingBag,
  'car': Car,
  'star': Star,
  'book-open': BookOpen,
  'more-horizontal': MoreHorizontal,
  'chevron-right': ChevronRight,
  'check': Check,
  'x': X,
  'calendar': Calendar,
  'paperclip': Paperclip,
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#FFFFFF',
  className = '' 
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <View className={className}>
      <IconComponent size={size} color={color} />
    </View>
  );
};

// Mapa de categorías con iconos
export const categoryIcons: Record<string, { icon: IconName; emoji: string }> = {
  food: { icon: 'utensils', emoji: '🍕' },
  shopping: { icon: 'shopping-bag', emoji: '🛍️' },
  transport: { icon: 'car', emoji: '🚗' },
  health: { icon: 'star', emoji: '💪' },
  education: { icon: 'book-open', emoji: '📚' },
  other: { icon: 'more-horizontal', emoji: '⚪' },
};
