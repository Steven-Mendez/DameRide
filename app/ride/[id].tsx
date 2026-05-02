import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  Share2, Car, Users, Star,
  MessageSquare, Ban, Timer, Luggage, MessageCircle,
  ArrowRight,
} from 'lucide-react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { DriverBadge } from '@/src/components/DriverBadge';
import { StatusChip } from '@/src/components/StatusChip';
import { RouteMapPreview } from '@/src/components/RouteMapPreview';
import { useAuth } from '@/src/hooks/useAuth';
import { getRideById, reserveSeat } from '@/src/lib/database';
import { formatCordobas, formatTime, getWhatsAppUrl } from '@/src/utils/format';
import { Colors, Shadows } from '@/src/constants/theme';
import type { RideWithDriver } from '@/src/types/database';

export default function RideDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [ride, setRide] = useState<RideWithDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    if (id) {
      getRideById(id).then((data) => {
        setRide(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleReserve = async () => {
    if (!user || !ride) return;

    if (user.id === ride.driver_id) {
      Alert.alert('Error', 'No puedes reservar tu propio viaje.');
      return;
    }

    Alert.alert(
      'Reservar asiento',
      `¿Confirmas tu reserva en el viaje ${ride.origin} → ${ride.destination} por ${formatCordobas(ride.price_cordobas)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reservar',
          onPress: async () => {
            setReserving(true);
            const { error } = await reserveSeat(ride.id);
            setReserving(false);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              setReserved(true);
              // Refresh ride data
              const updated = await getRideById(ride.id);
              if (updated) setRide(updated);
              setTimeout(() => setReserved(false), 4000);
            }
          },
        },
      ]
    );
  };

  const handleWhatsApp = () => {
    if (ride?.driver?.phone) {
      const message = `¡Hola! Me interesa tu viaje ${ride.origin} → ${ride.destination} en DameRide.`;
      Linking.openURL(getWhatsAppUrl(ride.driver.phone, message)).catch(() => {
        Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
      });
    }
  };

  if (loading || !ride) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="font-jakarta text-base text-outline">Cargando viaje...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Success Toast */}
      {reserved && (
        <View className="absolute top-20 left-0 right-0 z-50 items-center px-5">
          <View className="bg-primary px-8 py-4 rounded-xl flex-row items-center gap-3"
            style={Shadows.action}
          >
            <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center">
              <Text className="text-white text-sm">✓</Text>
            </View>
            <Text className="font-jakarta-bold text-white">Reserva confirmada</Text>
          </View>
        </View>
      )}

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <AppHeader
          showBack
          rightIcon={
            <TouchableOpacity className="p-2" activeOpacity={0.7}>
              <Share2 size={22} color="#6b7280" />
            </TouchableOpacity>
          }
        />

        <View className="px-5 py-6 gap-6">
          {/* Journey Header Card */}
          <View
            className="bg-white rounded-[20px] p-6 border border-outline-variant/20"
            style={Shadows.surface}
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <StatusChip status="active" label="Viaje Confirmado" />
                <Text className="font-jakarta-bold text-3xl text-on-surface mt-3 tracking-tight">
                  {ride.origin} → {ride.destination}
                </Text>
              </View>
              <View className="bg-primary-container/20 px-4 py-2 rounded-xl ml-3">
                <Text className="font-jakarta-bold text-lg text-on-primary-container">
                  {formatCordobas(ride.price_cordobas)}
                </Text>
              </View>
            </View>

            {/* Timeline */}
            <View className="flex-row gap-4 py-4">
              <View className="items-center">
                <View className="w-3 h-3 rounded-full border-2 border-primary bg-white" />
                <View className="w-0.5 h-12 bg-outline-variant my-1" />
                <View className="w-3 h-3 rounded-full bg-primary" />
              </View>
              <View className="flex-1 gap-6">
                <View>
                  <Text className="font-jakarta-bold text-2xl text-on-surface">
                    {formatTime(ride.departure_time)}
                  </Text>
                  <Text className="font-jakarta-medium text-sm text-on-surface-variant mt-1">
                    {ride.origin_place_name ?? ride.meeting_point ?? ride.origin}
                  </Text>
                </View>
                <View>
                  <Text className="font-jakarta-bold text-2xl text-on-surface">
                    {ride.estimated_arrival_time
                      ? formatTime(ride.estimated_arrival_time)
                      : '--:--'}
                  </Text>
                  <Text className="font-jakarta-medium text-sm text-on-surface-variant mt-1">
                    {ride.destination_place_name ?? ride.destination}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Driver & Vehicle Card */}
          <View
            className="bg-white rounded-[20px] overflow-hidden border border-outline-variant/20"
            style={Shadows.surface}
          >
            <View className="p-6 flex-row items-center justify-between border-b border-outline-variant/20">
              <View className="flex-row items-center gap-3">
                <DriverBadge name={ride.driver?.full_name} size="md" />
                <View>
                  <Text className="font-jakarta-semibold text-sm text-on-surface">
                    {ride.driver?.full_name ?? 'Conductor'}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Star size={14} fill={Colors.amber400} color={Colors.amber400} />
                    <Text className="font-jakarta-bold text-xs">
                      {ride.driver?.rating ?? '5.0'}
                    </Text>
                    <Text className="font-jakarta text-xs text-on-surface-variant ml-1">
                      ({ride.driver?.completed_rides ?? 0} viajes)
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                className="bg-surface-container-low p-3 rounded-full"
                onPress={handleWhatsApp}
                activeOpacity={0.7}
              >
                <MessageSquare size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Vehicle */}
            <View className="p-6 flex-row items-center justify-between bg-surface-container-lowest">
              <View className="flex-row items-center gap-3">
                <Car size={22} color={Colors.onSurfaceVariant} />
                <View>
                  <Text className="font-jakarta-medium text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Vehículo
                  </Text>
                  <Text className="font-jakarta-semibold text-sm">
                    {ride.vehicle
                      ? `${ride.vehicle.make} ${ride.vehicle.model} • ${ride.vehicle.color}`
                      : 'No especificado'}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <Users size={16} color={Colors.primary} />
                <Text className="font-jakarta-bold text-sm text-primary">
                  {ride.available_seats} disponible{ride.available_seats !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-jakarta-bold text-2xl text-on-surface tracking-tight px-1">
              Punto de encuentro
            </Text>
            <View className="bg-white rounded-[16px] p-4 border border-outline-variant/20 gap-2">
              <Text className="font-jakarta-semibold text-sm text-on-surface">
                {ride.origin_place_name ?? ride.meeting_point ?? 'Sin punto exacto registrado'}
              </Text>
              {!!ride.origin_address && (
                <Text className="font-jakarta text-xs text-on-surface-variant">
                  {ride.origin_address}
                </Text>
              )}
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-jakarta-bold text-2xl text-on-surface tracking-tight px-1">
              Destino exacto
            </Text>
            <View className="bg-white rounded-[16px] p-4 border border-outline-variant/20 gap-2">
              <Text className="font-jakarta-semibold text-sm text-on-surface">
                {ride.destination_place_name ?? ride.destination}
              </Text>
              {!!ride.destination_address && (
                <Text className="font-jakarta text-xs text-on-surface-variant">
                  {ride.destination_address}
                </Text>
              )}
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-jakarta-bold text-2xl text-on-surface tracking-tight px-1">
              Ver trayecto
            </Text>
            <RouteMapPreview
              origin={
                ride.origin_lat != null && ride.origin_lng != null
                  ? { latitude: ride.origin_lat, longitude: ride.origin_lng }
                  : null
              }
              destination={
                ride.destination_lat != null && ride.destination_lng != null
                  ? { latitude: ride.destination_lat, longitude: ride.destination_lng }
                  : null
              }
              routePolyline={ride.route_polyline}
              height={220}
            />
            {(ride.route_distance_meters != null || ride.route_duration_seconds != null) && (
              <Text className="font-jakarta text-xs text-on-surface-variant px-1">
                {ride.route_distance_meters != null ? `Distancia: ${(ride.route_distance_meters / 1000).toFixed(1)} km` : ''}
                {ride.route_distance_meters != null && ride.route_duration_seconds != null ? ' • ' : ''}
                {ride.route_duration_seconds != null ? `Duración estimada: ${Math.round(ride.route_duration_seconds / 60)} min` : ''}
              </Text>
            )}
          </View>

          {/* Ride Rules */}
          {ride.notes && (
            <View className="gap-3">
              <Text className="font-jakarta-bold text-2xl text-on-surface tracking-tight px-1">
                Reglas del viaje
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ride.notes.includes('fumar') && (
                  <View className="flex-row items-center gap-2 px-4 py-3 bg-surface-container rounded-full border border-outline-variant/20">
                    <Ban size={16} color={Colors.onSurfaceVariant} />
                    <Text className="font-jakarta-medium text-sm">No fumar</Text>
                  </View>
                )}
                {ride.notes.includes('puntual') && (
                  <View className="flex-row items-center gap-2 px-4 py-3 bg-surface-container rounded-full border border-outline-variant/20">
                    <Timer size={16} color={Colors.onSurfaceVariant} />
                    <Text className="font-jakarta-medium text-sm">Ser puntual</Text>
                  </View>
                )}
                {ride.notes.includes('equipaje') && (
                  <View className="flex-row items-center gap-2 px-4 py-3 bg-surface-container rounded-full border border-outline-variant/20">
                    <Luggage size={16} color={Colors.onSurfaceVariant} />
                    <Text className="font-jakarta-medium text-sm">Equipaje pequeño</Text>
                  </View>
                )}
                {ride.notes.includes('WhatsApp') && (
                  <View className="flex-row items-center gap-2 px-4 py-3 bg-surface-container rounded-full border border-outline-variant/20">
                    <MessageCircle size={16} color={Colors.onSurfaceVariant} />
                    <Text className="font-jakarta-medium text-sm">Confirmar por WhatsApp</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-outline-variant/20 p-6"
        style={Shadows.bottomBar}
      >
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <Text className="font-jakarta text-xs text-on-surface-variant">
              Total por asiento
            </Text>
            <Text className="font-jakarta-bold text-3xl text-primary tracking-tight">
              {formatCordobas(ride.price_cordobas)}.00
            </Text>
          </View>
          <TouchableOpacity
            className={`flex-[1.5] h-14 rounded-xl flex-row items-center justify-center gap-3 ${
              ride.available_seats > 0 ? 'bg-primary' : 'bg-gray-400'
            }`}
            style={ride.available_seats > 0 ? Shadows.action : undefined}
            onPress={handleReserve}
            disabled={reserving || ride.available_seats === 0}
            activeOpacity={0.8}
          >
            {reserving ? (
              <Text className="font-jakarta-bold text-lg text-white">Reservando...</Text>
            ) : (
              <>
                <Text className="font-jakarta-bold text-lg text-white">
                  {ride.available_seats > 0 ? 'Reservar asiento' : 'Sin asientos'}
                </Text>
                {ride.available_seats > 0 && (
                  <ArrowRight size={20} color="#ffffff" />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
