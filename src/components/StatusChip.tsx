import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, Clock, XCircle, CircleDot } from 'lucide-react-native';
import { Colors } from '../constants/theme';

interface StatusChipProps {
  status: 'confirmed' | 'pending' | 'cancelled' | 'active';
  label?: string;
}

const statusConfig = {
  confirmed: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    label: 'Confirmado',
    iconColor: Colors.primary,
    Icon: CheckCircle2,
  },
  active: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    label: 'Viaje Confirmado',
    iconColor: Colors.primary,
    Icon: CircleDot,
  },
  pending: {
    bg: 'bg-tertiary-container/20',
    text: 'text-tertiary',
    label: 'Pendiente',
    iconColor: Colors.tertiary,
    Icon: Clock,
  },
  cancelled: {
    bg: 'bg-error-container',
    text: 'text-error',
    label: 'Cancelado',
    iconColor: Colors.error,
    Icon: XCircle,
  },
};

export function StatusChip({ status, label }: StatusChipProps) {
  const config = statusConfig[status];
  const IconComponent = config.Icon;

  return (
    <View className={`flex-row items-center gap-1 self-start ${config.bg} px-2 py-1 rounded-lg`}>
      <IconComponent size={16} color={config.iconColor} fill={config.iconColor} />
      <Text className={`font-jakarta-semibold text-xs ${config.text} uppercase tracking-wider`}>
        {label || config.label}
      </Text>
    </View>
  );
}
