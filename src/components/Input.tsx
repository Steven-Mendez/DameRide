import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, style, ...props }: InputProps) {
  return (
    <View className="gap-1">
      {label && (
        <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1 mb-1">
          {label}
        </Text>
      )}
      <View className="relative">
        {icon && (
          <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
            {icon}
          </View>
        )}
        <TextInput
          className={`h-14 bg-surface-container-low rounded-input px-4 font-jakarta text-base text-on-surface ${
            icon ? 'pl-12' : ''
          } ${error ? 'border border-error' : ''}`}
          placeholderTextColor="#6c7b6d"
          style={style}
          {...props}
        />
      </View>
      {error && (
        <Text className="font-jakarta text-xs text-error ml-1">{error}</Text>
      )}
    </View>
  );
}
