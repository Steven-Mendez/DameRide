import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Car, Route } from 'lucide-react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { ReservationCard } from '@/src/components/ReservationCard';
import { RideCard } from '@/src/components/RideCard';
import { useAuth } from '@/src/hooks/useAuth';
import { getMyReservations, cancelReservation, getMyRides } from '@/src/lib/database';
import { useRealtimeReservations, useRealtimeRides } from '@/src/hooks/useRealtime';
import { Colors } from '@/src/constants/theme';
import type { ReservationWithDetails, RideWithDriver } from '@/src/types/database';

type TripsTab = 'reservations' | 'published';

export default function ReservasScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [publishedRides, setPublishedRides] = useState<RideWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TripsTab>('reservations');

  const fetchTrips = useCallback(async () => {
    if (!user) return;
    const [reservationsData, ridesData] = await Promise.all([
      getMyReservations(user.id),
      getMyRides(user.id),
    ]);
    setReservations(reservationsData);
    setPublishedRides(ridesData);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Realtime updates
  useRealtimeReservations(
    user?.id,
    useCallback(() => {
      fetchTrips();
    }, [fetchTrips])
  );

  useRealtimeRides(
    useCallback((payload) => {
      const row = payload.new ?? payload.old;
      if ('driver_id' in row && row.driver_id === user?.id) {
        fetchTrips();
      }
    }, [fetchTrips, user?.id])
  );

  const handleCancel = (reservationId: string) => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setCancellingId(reservationId);
            const { error } = await cancelReservation(reservationId);
            setCancellingId(null);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              fetchTrips();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchTrips();
          }} />
        }
      >
        {/* Header */}
        <AppHeader />

        <View className="px-5 py-6">
          <Text className="font-jakarta-bold text-[30px] text-on-surface mb-1 tracking-tight">
            Mis Viajes
          </Text>
          <Text className="font-jakarta text-base text-on-surface-variant mb-6">
            Gestiona tus reservas y los viajes que publicaste
          </Text>

          <View className="flex-row p-1 bg-surface-container-low rounded-2xl mb-5">
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 items-center ${activeTab === 'reservations' ? 'bg-white' : ''}`}
              activeOpacity={0.8}
              onPress={() => setActiveTab('reservations')}
            >
              <Text className={`font-jakarta-bold text-sm ${activeTab === 'reservations' ? 'text-primary' : 'text-on-surface-variant'}`}>
                Reservas ({reservations.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 items-center ${activeTab === 'published' ? 'bg-white' : ''}`}
              activeOpacity={0.8}
              onPress={() => setActiveTab('published')}
            >
              <Text className={`font-jakarta-bold text-sm ${activeTab === 'published' ? 'text-primary' : 'text-on-surface-variant'}`}>
                Publicados ({publishedRides.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-5">
            {loading ? (
              <View className="items-center py-12">
                <Text className="font-jakarta text-base text-outline">Cargando...</Text>
              </View>
            ) : activeTab === 'reservations' && reservations.length === 0 ? (
              <>
                <View className="items-center py-12 border-2 border-dashed border-outline-variant/40 rounded-[20px]">
                  <Route size={48} color={Colors.outline} />
                  <Text className="font-jakarta-semibold text-base text-outline mt-4">
                    No tienes reservas activas
                  </Text>
                  <Text className="font-jakarta text-sm text-outline mt-1 mb-4">
                    Busca un viaje para comenzar
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/buscar')}>
                    <Text className="font-jakarta-semibold text-sm text-primary">
                      Explorar nuevas rutas
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : activeTab === 'reservations' ? (
              <>
                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={handleCancel}
                    cancelling={cancellingId === reservation.id}
                  />
                ))}

                {/* Empty state suggestion */}
                <View className="p-8 items-center border-2 border-dashed border-outline-variant/40 rounded-[20px]">
                  <Route size={36} color={Colors.outline} />
                  <Text className="font-jakarta-semibold text-sm text-outline mt-3 mb-3">
                    ¿Necesitas otro viaje?
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/buscar')}>
                    <Text className="font-jakarta-semibold text-sm text-primary">
                      Explorar nuevas rutas
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : publishedRides.length === 0 ? (
              <View className="items-center py-12 border-2 border-dashed border-outline-variant/40 rounded-[20px]">
                <Car size={48} color={Colors.outline} />
                <Text className="font-jakarta-semibold text-base text-outline mt-4">
                  No has publicado viajes
                </Text>
                <Text className="font-jakarta text-sm text-outline mt-1 mb-4 text-center px-6">
                  Publica tu primera ruta para que otros puedan reservar asiento.
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/publicar')}>
                  <Text className="font-jakarta-semibold text-sm text-primary">
                    Publicar un viaje
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {publishedRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} actionLabel="Ver mi viaje" />
                ))}

                <View className="p-8 items-center border-2 border-dashed border-outline-variant/40 rounded-[20px]">
                  <Car size={36} color={Colors.outline} />
                  <Text className="font-jakarta-semibold text-sm text-outline mt-3 mb-3">
                    ¿Tienes otra ruta disponible?
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/publicar')}>
                    <Text className="font-jakarta-semibold text-sm text-primary">
                      Publicar otro viaje
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
