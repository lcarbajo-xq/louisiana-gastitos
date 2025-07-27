import React from 'react';
import { View, Text } from 'react-native';
import { Icon, IconName } from './Icon';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  text: string;
  icon?: IconName;
  variant?: 'filled' | 'outlined' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  icon,
  variant = 'filled',
  size = 'md',
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          filled: 'bg-green-600 border-green-600',
          outlined: 'bg-transparent border-green-600',
          subtle: 'bg-green-600/20 border-green-600/30',
          textColor: variant === 'filled' ? 'text-white' : 'text-green-400',
          iconColor: variant === 'filled' ? '#FFFFFF' : '#10B981',
        };
      case 'warning':
        return {
          filled: 'bg-yellow-600 border-yellow-600',
          outlined: 'bg-transparent border-yellow-600',
          subtle: 'bg-yellow-600/20 border-yellow-600/30',
          textColor: variant === 'filled' ? 'text-white' : 'text-yellow-400',
          iconColor: variant === 'filled' ? '#FFFFFF' : '#F59E0B',
        };
      case 'error':
        return {
          filled: 'bg-red-600 border-red-600',
          outlined: 'bg-transparent border-red-600',
          subtle: 'bg-red-600/20 border-red-600/30',
          textColor: variant === 'filled' ? 'text-white' : 'text-red-400',
          iconColor: variant === 'filled' ? '#FFFFFF' : '#EF4444',
        };
      case 'info':
        return {
          filled: 'bg-blue-600 border-blue-600',
          outlined: 'bg-transparent border-blue-600',
          subtle: 'bg-blue-600/20 border-blue-600/30',
          textColor: variant === 'filled' ? 'text-white' : 'text-blue-400',
          iconColor: variant === 'filled' ? '#FFFFFF' : '#3B82F6',
        };
      case 'neutral':
      default:
        return {
          filled: 'bg-gray-600 border-gray-600',
          outlined: 'bg-transparent border-gray-600',
          subtle: 'bg-gray-600/20 border-gray-600/30',
          textColor: variant === 'filled' ? 'text-white' : 'text-gray-300',
          iconColor: variant === 'filled' ? '#FFFFFF' : '#D1D5DB',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 rounded-md',
          text: 'text-xs',
          icon: 12,
        };
      case 'md':
        return {
          container: 'px-3 py-1.5 rounded-lg',
          text: 'text-sm',
          icon: 14,
        };
      case 'lg':
        return {
          container: 'px-4 py-2 rounded-xl',
          text: 'text-base',
          icon: 16,
        };
      default:
        return {
          container: 'px-3 py-1.5 rounded-lg',
          text: 'text-sm',
          icon: 14,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeStyles();
  const backgroundStyle = statusConfig[variant];

  return (
    <View className={`flex-row items-center border ${backgroundStyle} ${sizeConfig.container} ${className}`}>
      {icon && (
        <Icon
          name={icon}
          size={sizeConfig.icon}
          color={statusConfig.iconColor}
          className="mr-1.5"
        />
      )}
      <Text className={`${statusConfig.textColor} ${sizeConfig.text} font-medium`}>
        {text}
      </Text>
    </View>
  );
};
