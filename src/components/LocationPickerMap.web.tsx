import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from './Button';
import { Colors } from '../constants/theme';
import type { MapPointSelection } from '../types/database';

interface LocationPickerMapProps {
  visible: boolean;
  title: string;
  confirmLabel?: string;
  initialValue?: MapPointSelection;
  onConfirm: (selection: MapPointSelection) => void;
  onClose: () => void;
}

export function LocationPickerMap({ visible, title, confirmLabel = 'Confirmar ubicacion', initialValue, onConfirm, onClose }: LocationPickerMapProps) {
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-background p-6 justify-center gap-4">
        <TouchableOpacity onPress={onClose} className="absolute right-5 top-5 p-2">
          <X size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text className="font-jakarta-bold text-xl text-on-surface text-center">{title}</Text>
        <Text className="font-jakarta text-sm text-on-surface-variant text-center">
          El mapa interactivo esta disponible en iOS y Android.
        </Text>
        <Button
          title={confirmLabel}
          disabled={!initialValue}
          onPress={() => {
            if (initialValue) onConfirm(initialValue);
          }}
        />
        <Button title="Cerrar" variant="ghost" onPress={onClose} />
      </View>
    </Modal>
  );
}
