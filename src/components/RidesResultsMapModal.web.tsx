import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import type { RideWithDriver } from '../types/database';

interface RidesResultsMapModalProps {
  visible: boolean;
  rides: RideWithDriver[];
  onClose: () => void;
}

export function RidesResultsMapModal({ visible, rides, onClose }: RidesResultsMapModalProps) {
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-background p-6 justify-center gap-4">
        <TouchableOpacity onPress={onClose} className="absolute right-5 top-5 p-2">
          <X size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text className="font-jakarta-bold text-xl text-on-surface text-center">
          Vista de mapa disponible en iOS y Android.
        </Text>
        <Text className="font-jakarta text-sm text-on-surface-variant text-center">
          Se encontraron {rides.length} viajes. En web, revisalos en la lista de resultados.
        </Text>
      </View>
    </Modal>
  );
}
