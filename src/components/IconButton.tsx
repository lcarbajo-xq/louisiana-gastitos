import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  label?: string;
  loading?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  label,
  loading = false,
  className = '',
}) => {
  const getVariantStyles = () => {
    const baseStyles = 'items-center justify-center rounded-xl';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-blue-600 active:bg-blue-700 ${disabled ? 'bg-gray-600' : ''}`;
      case 'secondary':
        return `${baseStyles} bg-gray-700 active:bg-gray-800 border border-gray-600 ${disabled ? 'bg-gray-800 border-gray-700' : ''}`;
      case 'ghost':
        return `${baseStyles} bg-transparent active:bg-gray-800 ${disabled ? 'bg-transparent' : ''}`;
      case 'danger':
        return `${baseStyles} bg-red-600 active:bg-red-700 ${disabled ? 'bg-gray-600' : ''}`;
      default:
        return `${baseStyles} bg-blue-600 active:bg-blue-700`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { container: 'w-8 h-8', icon: 16, text: 'text-xs' };
      case 'md':
        return { container: 'w-10 h-10', icon: 20, text: 'text-sm' };
      case 'lg':
        return { container: 'w-12 h-12', icon: 24, text: 'text-base' };
      case 'xl':
        return { container: 'w-16 h-16', icon: 28, text: 'text-lg' };
      default:
        return { container: 'w-10 h-10', icon: 20, text: 'text-sm' };
    }
  };

  const getIconColor = () => {
    if (disabled) return '#9CA3AF';
    
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
      case 'ghost':
        return '#E5E7EB';
      default:
        return '#FFFFFF';
    }
  };

  const variantStyles = getVariantStyles();
  const sizeConfig = getSizeStyles();
  const iconColor = getIconColor();

  if (label) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        className={`flex-col items-center gap-1 ${className}`}
        activeOpacity={0.7}
      >
        <View className={`${variantStyles} ${sizeConfig.container}`}>
          <Icon 
            name={loading ? 'more-horizontal' : icon} 
            size={sizeConfig.icon} 
            color={iconColor} 
          />
        </View>
        <Text className={`text-white ${sizeConfig.text} font-medium`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${variantStyles} ${sizeConfig.container} ${className}`}
      activeOpacity={0.7}
    >
      <Icon 
        name={loading ? 'more-horizontal' : icon} 
        size={sizeConfig.icon} 
        color={iconColor} 
      />
    </TouchableOpacity>
  );
};
