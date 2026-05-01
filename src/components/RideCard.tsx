import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DriverBadge } from './DriverBadge';
import { formatCordobas, formatDate, formatTime } from '../utils/format';
import type { RideWithDriver } from '../types/database';
import { Calendar, Clock, Users, Star } from 'lucide-react-native';
import { Colors, Shadows } from '../constants/theme';

interface RideCardProps {
  ride: RideWithDriver;
  actionLabel?: string;
}

export function RideCard({ ride, actionLabel = 'Ver detalles y reservar' }: RideCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-surface-container-lowest rounded-[20px] p-4 border border-outline-variant/20"
      style={Shadows.sm}
      activeOpacity={0.7}
      onPress={() => router.push(`/ride/${ride.id}`)}
    >
      {/* Header: Driver + Price */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3">
          <DriverBadge name={ride.driver?.full_name} avatarUrl={ride.driver?.avatar_url} size="md" />
          <View>
            <Text className="font-jakarta-bold text-base text-on-surface">
              {ride.driver?.full_name ?? 'Conductor'}
            </Text>
            <View className="flex-row items-center gap-1">
              <Star size={14} fill={Colors.amber400} color={Colors.amber400} />
              <Text className="font-jakarta-medium text-xs text-tertiary">
                {ride.driver?.rating ?? '5.0'}
              </Text>
            </View>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-jakarta-extrabold text-2xl text-primary">
            {formatCordobas(ride.price_cordobas)}
          </Text>
          <Text className="font-jakarta text-xs text-outline">por asiento</Text>
        </View>
      </View>

      {/* Route Timeline */}
      <View className="flex-row items-center gap-6 mb-4">
        <View className="items-center gap-1">
          <View className="w-3 h-3 rounded-full border-2 border-primary" />
          <View className="w-0.5 h-8 bg-outline-variant/30" />
          <View className="w-3 h-3 rounded-full bg-secondary" />
        </View>
        <View className="flex-1 gap-4">
          <View>
            <Text className="font-jakarta-medium text-[10px] text-outline uppercase tracking-wider">
              Origen
            </Text>
            <Text className="font-jakarta-extrabold text-lg text-on-surface" numberOfLines={1}>
              {ride.origin}
            </Text>
            {!!ride.origin_place_name && (
              <Text className="font-jakarta text-xs text-on-surface-variant" numberOfLines={1}>
                {ride.origin_place_name}
              </Text>
            )}
          </View>
          <View>
            <Text className="font-jakarta-medium text-[10px] text-outline uppercase tracking-wider">
              Destino
            </Text>
            <Text className="font-jakarta-extrabold text-lg text-on-surface" numberOfLines={1}>
              {ride.destination}
            </Text>
            {!!ride.destination_place_name && (
              <Text className="font-jakarta text-xs text-on-surface-variant" numberOfLines={1}>
                {ride.destination_place_name}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Footer: Date + Time + Seats */}
      <View className="flex-row items-center justify-between border-t border-surface-container pt-4 mb-2">
        <View className="flex-row flex-wrap gap-3">
          <View className="flex-row items-center gap-1">
            <Calendar size={16} color={Colors.outline} />
            <Text className="font-jakarta-semibold text-sm text-outline">
              {formatDate(ride.departure_time)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Clock size={16} color={Colors.outline} />
            <Text className="font-jakarta-semibold text-sm text-outline">
              {formatTime(ride.departure_time)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Users size={16} color={Colors.outline} />
            <Text className="font-jakarta-semibold text-sm text-outline">
              {ride.available_seats} asientos
            </Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity
        className="w-full py-3 bg-primary-container rounded-xl items-center mt-1"
        activeOpacity={0.7}
        onPress={() => router.push(`/ride/${ride.id}`)}
      >
        <Text className="font-jakarta-bold text-sm text-on-primary-container">
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
