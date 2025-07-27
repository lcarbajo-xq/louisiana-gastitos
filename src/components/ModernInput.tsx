import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface ModernInputProps extends TextInputProps {
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

export const ModernInput: React.FC<ModernInputProps> = ({
  placeholder,
  value,
  onChangeText,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseClasses = 'rounded-xl text-white font-sf-pro placeholder:text-gray-400';
  
  const variantClasses = {
    default: 'bg-gray-700',
    outlined: 'bg-transparent border border-gray-600',
    filled: 'bg-gray-800',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-body-lg',
    lg: 'px-5 py-4 text-lg',
  };

  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      placeholderTextColor='#9CA3AF'
      {...props}
    />
  );
};
