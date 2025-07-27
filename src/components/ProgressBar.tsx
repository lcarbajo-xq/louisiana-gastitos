import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}) => {
  // Asegurar que el progreso esté entre 0 y 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          track: 'bg-green-900/30',
          fill: 'bg-green-500',
          text: 'text-green-400',
        };
      case 'warning':
        return {
          track: 'bg-yellow-900/30',
          fill: 'bg-yellow-500',
          text: 'text-yellow-400',
        };
      case 'danger':
        return {
          track: 'bg-red-900/30',
          fill: 'bg-red-500',
          text: 'text-red-400',
        };
      case 'default':
      default:
        return {
          track: 'bg-gray-700',
          fill: 'bg-blue-500',
          text: 'text-blue-400',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 'h-1',
          text: 'text-xs',
        };
      case 'md':
        return {
          height: 'h-2',
          text: 'text-sm',
        };
      case 'lg':
        return {
          height: 'h-3',
          text: 'text-base',
        };
      default:
        return {
          height: 'h-2',
          text: 'text-sm',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View className={`w-full ${className}`}>
      {(showLabel || label) && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className={`${variantStyles.text} ${sizeStyles.text} font-medium`}>
            {label || `Progreso`}
          </Text>
          <Text className={`${variantStyles.text} ${sizeStyles.text} font-bold`}>
            {Math.round(normalizedProgress)}%
          </Text>
        </View>
      )}
      
      <View className={`w-full ${sizeStyles.height} ${variantStyles.track} rounded-full overflow-hidden`}>
        <View
          className={`${sizeStyles.height} ${variantStyles.fill} rounded-full ${animated ? 'transition-all duration-300' : ''}`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </View>
    </View>
  );
};

// Componente de progreso circular (bonus)
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 60,
  strokeWidth = 6,
  variant = 'default',
  showLabel = true,
  className = '',
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'danger':
        return '#EF4444';
      case 'default':
      default:
        return '#3B82F6';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'danger':
        return 'text-red-400';
      case 'default':
      default:
        return 'text-blue-400';
    }
  };

  return (
    <View className={`items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <View className="absolute">
        {/* SVG sería mejor aquí, pero para simplificar usamos View */}
        <View
          className="border-4 border-gray-700 rounded-full"
          style={{ width: size, height: size }}
        />
        <View
          className={`border-4 rounded-full absolute top-0 left-0`}
          style={{
            width: size,
            height: size,
            borderColor: getVariantColor(),
            transform: [{ rotate: '-90deg' }],
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
          }}
        />
      </View>
      
      {showLabel && (
        <Text className={`${getTextColor()} text-sm font-bold`}>
          {Math.round(normalizedProgress)}%
        </Text>
      )}
    </View>
  );
};
