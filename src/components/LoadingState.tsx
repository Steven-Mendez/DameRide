import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Colors } from '../constants/theme';

interface LoadingStateProps {
  title?: string;
  message?: string;
  compact?: boolean;
}

export function LoadingState({ title = 'Cargando...', message, compact = false }: LoadingStateProps) {
  return (
    <View className={`items-center justify-center px-6 ${compact ? 'py-4' : 'py-12'}`}>
      <ActivityIndicator color={Colors.primary} size={compact ? 'small' : 'large'} />
      <Text className="font-jakarta-semibold text-sm text-on-surface-variant mt-3 text-center">
        {title}
      </Text>
      {!!message && (
        <Text className="font-jakarta text-xs text-outline mt-1 text-center">
          {message}
        </Text>
      )}
    </View>
  );
}
