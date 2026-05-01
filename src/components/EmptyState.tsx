import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-12">
      {icon && (
        <View className="w-16 h-16 rounded-full bg-surface-container-low items-center justify-center mb-4">
          {icon}
        </View>
      )}
      <Text className="font-jakarta-bold text-lg text-on-surface text-center">
        {title}
      </Text>
      {!!message && (
        <Text className="font-jakarta text-sm text-on-surface-variant text-center mt-2 leading-5">
          {message}
        </Text>
      )}
      {!!actionLabel && !!onAction && (
        <View className="mt-5 w-full">
          <Button title={actionLabel} onPress={onAction} variant="ghost" />
        </View>
      )}
    </View>
  );
}
