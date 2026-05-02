import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { DriverBadge } from './DriverBadge';
import { StatusChip } from './StatusChip';
import { formatRelativeDateTime, getWhatsAppUrl } from '../utils/format';
import type { ReservationWithDetails } from '../types/database';
import { Star, ArrowRight, MessageSquare } from 'lucide-react-native';
import { Colors, Shadows } from '../constants/theme';

interface ReservationCardProps {
  reservation: ReservationWithDetails;
  onCancel: (id: string) => void;
  cancelling?: boolean;
}

export function ReservationCard({ reservation, onCancel, cancelling }: ReservationCardProps) {
  const { ride, driver, vehicle } = reservation;

  const handleWhatsApp = () => {
    if (driver?.phone) {
      const message = `¡Hola! Soy tu pasajero en DameRide para el viaje ${ride.origin} → ${ride.destination}`;
      Linking.openURL(getWhatsAppUrl(driver.phone, message)).catch(() => {
        Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
      });
    } else {
      Alert.alert('Sin teléfono', 'El conductor no ha registrado número de teléfono.');
    }
  };

  return (
    <View
      className="bg-surface-container-lowest rounded-[20px] border border-outline-variant/20 p-5 gap-4"
      style={Shadows.surface}
    >
      {/* Status + Route + Time */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <StatusChip
            status={reservation.status === 'confirmed' ? 'confirmed' : 'pending'}
          />
          <View className="flex-row items-center gap-2 mt-3">
            <Text className="font-jakarta-bold text-2xl text-on-surface">
              {ride.origin}
            </Text>
            <ArrowRight size={20} color={Colors.outline} />
            <Text className="font-jakarta-bold text-2xl text-on-surface">
              {ride.destination}
            </Text>
          </View>
        </View>
        <View className="bg-primary-container/10 px-3 py-2 rounded-xl">
          <Text className="font-jakarta-semibold text-xs text-on-primary-container">
            {formatRelativeDateTime(ride.departure_time)}
          </Text>
        </View>
      </View>

      {/* Driver Info */}
      <View className="flex-row items-center justify-between py-4 border-y border-outline-variant/30">
        <View className="flex-row items-center gap-3">
          <DriverBadge name={driver?.full_name} avatarUrl={driver?.avatar_url} size="md" />
          <View>
            <Text className="font-jakarta-semibold text-sm text-on-surface">
              {driver?.full_name ?? 'Conductor'}
            </Text>
            <Text className="font-jakarta text-xs text-outline">
              {vehicle ? `${vehicle.make} ${vehicle.model} • ${vehicle.color}` : ''}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <Star size={16} fill={Colors.amber400} color={Colors.amber400} />
          <Text className="font-jakarta-semibold text-sm text-primary">
            {driver?.rating ?? '5.0'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 h-14 bg-white border border-error rounded-xl items-center justify-center"
          onPress={() => onCancel(reservation.id)}
          disabled={cancelling}
          activeOpacity={0.7}
        >
          <Text className="font-jakarta-semibold text-sm text-error">
            {cancelling ? 'Cancelando...' : 'Cancelar reserva'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="h-14 w-14 bg-secondary-container rounded-xl items-center justify-center"
          onPress={handleWhatsApp}
          activeOpacity={0.7}
        >
          <MessageSquare size={22} color={Colors.onSecondaryContainer} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
