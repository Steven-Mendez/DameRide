import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from './Button';
import { Colors } from '../constants/theme';
import type { MapPointSelection } from '../types/database';
import type { RouteResult } from '../utils/maps';

interface RouteLocationPickerMapProps {
  visible: boolean;
  initialOrigin?: MapPointSelection;
  initialDestination?: MapPointSelection;
  onConfirm: (value: {
    origin: MapPointSelection;
    destination: MapPointSelection;
    routeResult: RouteResult | null;
  }) => void;
  onClose: () => void;
}

export function RouteLocationPickerMap({ visible, initialOrigin, initialDestination, onConfirm, onClose }: RouteLocationPickerMapProps) {
  const canConfirm = Boolean(initialOrigin && initialDestination);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-background p-6 justify-center gap-4">
        <TouchableOpacity onPress={onClose} className="absolute right-5 top-5 p-2">
          <X size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text className="font-jakarta-bold text-xl text-on-surface text-center">
          El selector de ruta con mapa esta disponible en iOS y Android.
        </Text>
        <Text className="font-jakarta text-sm text-on-surface-variant text-center">
          Usa la app nativa para elegir puntos desde el mapa interactivo.
        </Text>
        <Button
          title="Usar ubicaciones actuales"
          disabled={!canConfirm}
          onPress={() => {
            if (initialOrigin && initialDestination) {
              onConfirm({ origin: initialOrigin, destination: initialDestination, routeResult: null });
            }
          }}
        />
        <Button title="Cerrar" variant="ghost" onPress={onClose} />
      </View>
    </Modal>
  );
}
