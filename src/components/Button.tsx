import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { Shadows } from '../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'primary-container' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-primary',
  'primary-container': 'bg-primary-container',
  secondary: 'bg-secondary-container',
  danger: 'bg-error-container border border-error/20',
  ghost: 'bg-surface-container',
};

const textClasses = {
  primary: 'text-on-primary',
  'primary-container': 'text-on-primary-container',
  secondary: 'text-on-secondary-container',
  danger: 'text-on-error-container',
  ghost: 'text-on-surface-variant',
};

export function Button({
  title,
  variant = 'primary',
  icon,
  loading,
  size = 'lg',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const heightClass = size === 'sm' ? 'h-10' : size === 'md' ? 'h-12' : 'h-14';
  const hasShadow = variant === 'primary' || variant === 'primary-container';

  return (
    <TouchableOpacity
      className={`${heightClass} rounded-xl flex-row items-center justify-center gap-2 px-6 ${
        variantClasses[variant]
      } ${disabled || loading ? 'opacity-60' : ''}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[hasShadow ? Shadows.action : undefined, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'secondary' || variant === 'primary-container'
              ? '#ffffff'
              : '#191c1d'
          }
        />
      ) : (
        <>
          {icon}
          <Text
            className={`font-jakarta-bold text-base ${textClasses[variant]}`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
