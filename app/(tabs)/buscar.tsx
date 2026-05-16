import { AppHeader } from '@/src/components/AppHeader';
import { Button } from '@/src/components/Button';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { RidesResultsMapModal } from '@/src/components/RidesResultsMapModal';
import { RideCard } from '@/src/components/RideCard';
import { RouteLocationPickerMap } from '@/src/components/RouteLocationPickerMap';
import { RouteMapPreview } from '@/src/components/RouteMapPreview';
import { Colors, Shadows } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRealtimeRides } from '@/src/hooks/useRealtime';
import { getRides } from '@/src/lib/database';
import type { MapPointSelection, RideWithDriver } from '@/src/types/database';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Calendar, Clock, MapPin, Route, Search, SlidersHorizontal, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SEARCH_PAGE_SIZE = 20;
const RADIUS_OPTIONS_KM = [1, 3, 5, 10];

export default function BuscarScreen() {
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [rides, setRides] = useState<RideWithDriver[]>([]);
  const [step, setStep] = useState<'filters' | 'results'>('filters');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('5000');
  const [pickupPoint, setPickupPoint] = useState<MapPointSelection | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<MapPointSelection | null>(null);
  const [routePickerVisible, setRoutePickerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(new Date());
  const [draftTime, setDraftTime] = useState<Date>(new Date());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest_pickup' | 'soonest' | 'lowest_price' | 'most_seats'>('soonest');
  const [showMapResultsModal, setShowMapResultsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const clearFilters = () => {
    setDate('');
    setTime('');
    setRadiusMeters('5000');
    setPickupPoint(null);
    setDestinationPoint(null);
    setSortBy('soonest');
    setShowMapResultsModal(false);
    setShowAdvancedFilters(false);
    setStep('filters');
  };

  const fetchRides = useCallback(async (pageToFetch = 0, append = false) => {
    const radiusValue = parseInt(radiusMeters, 10);
    const filters: {
      date?: string;
      time?: string;
      pickupLat?: number;
      pickupLng?: number;
      destinationLat?: number;
      destinationLng?: number;
      radiusMeters?: number;
      sortBy?: 'nearest_pickup' | 'soonest' | 'lowest_price' | 'most_seats';
      excludeDriverId?: string;
      page?: number;
      limit?: number;
    } = { sortBy };

    filters.page = pageToFetch;
    filters.limit = SEARCH_PAGE_SIZE;
    if (user?.id) filters.excludeDriverId = user.id;
    if (date.trim()) filters.date = date.trim();
    if (time.trim()) filters.time = time.trim();
    if (pickupPoint) {
      filters.pickupLat = pickupPoint.latitude;
      filters.pickupLng = pickupPoint.longitude;
    }
    if (destinationPoint) {
      filters.destinationLat = destinationPoint.latitude;
      filters.destinationLng = destinationPoint.longitude;
    }
    if (Number.isFinite(radiusValue) && radiusValue > 0) {
      filters.radiusMeters = radiusValue;
    }

    try {
      const { data, hasMore: nextHasMore } = await getRides(filters);
      const nextData = Array.isArray(data) ? data : [];

      setRides((current) => {
        if (!append) return nextData;

        const seen = new Set(current.map((ride) => ride.id));
        const next = nextData.filter((ride) => !seen.has(ride.id));
        return [...current, ...next];
      });
      setPage(pageToFetch);
      setHasMore(nextHasMore);
    } catch (error) {
      console.error('Error loading rides:', error);
      if (!append) setRides([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [date, time, pickupPoint, destinationPoint, radiusMeters, sortBy, user?.id]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleSearch = () => {
    setLoading(true);
    setPage(0);
    setHasMore(false);
    fetchRides(0).finally(() => {
      setStep('results');
    });
  };

  const toDateString = (selectedDate: Date) => {
    const y = selectedDate.getFullYear();
    const m = `${selectedDate.getMonth() + 1}`.padStart(2, '0');
    const d = `${selectedDate.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const toTimeString = (selectedTime: Date) => {
    const h = `${selectedTime.getHours()}`.padStart(2, '0');
    const m = `${selectedTime.getMinutes()}`.padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) return;
    setDraftDate(selectedDate);
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    if (!selectedTime) return;
    setDraftTime(selectedTime);
  };

  const openDatePicker = () => {
    setDraftDate(date ? new Date(`${date}T12:00:00`) : new Date());
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setDraftTime(time ? new Date(`1970-01-01T${time}:00`) : new Date());
    setShowTimePicker(true);
  };

  const applyDate = () => {
    setDate(toDateString(draftDate));
    setShowDatePicker(false);
  };

  const applyTime = () => {
    setTime(toTimeString(draftTime));
    setShowTimePicker(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides(0);
  };

  const loadMoreRides = () => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    setLoadingMore(true);
    fetchRides(page + 1, true);
  };

  // Realtime updates
  useRealtimeRides(
    useCallback(() => {
      fetchRides();
    }, [fetchRides])
  );

  const renderFiltersScreen = () => (
    <View className="flex-1">
      <View className="px-5 py-6">
        <Text className="font-jakarta-bold text-[30px] text-on-surface mb-5 tracking-tight">
          Buscar viaje
        </Text>
        <View
          className="bg-surface-container-lowest rounded-[24px] p-5 border border-outline-variant/20 gap-3"
          style={Shadows.surface}
        >
          <TouchableOpacity
            className="px-4 py-3 rounded-xl border border-outline-variant/40 bg-white flex-row items-center gap-3"
            activeOpacity={0.7}
            onPress={() => setRoutePickerVisible(true)}
          >
            <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
              <Route size={18} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-jakarta-semibold text-sm text-primary">
                Seleccionar salida y llegada
              </Text>
              <Text className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                {pickupPoint && destinationPoint
                  ? `${pickupPoint.placeName ?? 'Salida'} → ${destinationPoint.placeName ?? 'Llegada'}`
                  : 'Toca para seleccionar la ruta'}
              </Text>
            </View>
          </TouchableOpacity>

          <RouteMapPreview
            origin={pickupPoint ? { latitude: pickupPoint.latitude, longitude: pickupPoint.longitude } : null}
            destination={destinationPoint ? { latitude: destinationPoint.latitude, longitude: destinationPoint.longitude } : null}
            height={170}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1 mb-2">
                Fecha
              </Text>
              <TouchableOpacity
                className="h-14 bg-surface-container-low rounded-input px-4 flex-row items-center gap-3"
                activeOpacity={0.7}
                onPress={openDatePicker}
              >
                <Calendar size={20} color={Colors.outline} />
                <Text
                  className={`flex-1 font-jakarta text-base ${date ? 'text-on-surface' : 'text-outline'}`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {date || 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1 mb-2">
                Hora
              </Text>
              <TouchableOpacity
                className="h-14 bg-surface-container-low rounded-input px-4 flex-row items-center gap-3"
                activeOpacity={0.7}
                onPress={openTimePicker}
              >
                <Clock size={20} color={Colors.outline} />
                <Text
                  className={`flex-1 font-jakarta text-base ${time ? 'text-on-surface' : 'text-outline'}`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {time || 'Seleccionar hora'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="h-12 bg-surface-container-low rounded-xl px-4 flex-row items-center justify-between"
            onPress={() => setShowAdvancedFilters((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <SlidersHorizontal size={18} color={Colors.outline} />
              <Text className="font-jakarta-semibold text-sm text-on-surface-variant">
                Filtros avanzados
              </Text>
            </View>
            <Text className="font-jakarta-bold text-sm text-outline">
              {showAdvancedFilters ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>

          {showAdvancedFilters && (
            <View className="gap-3">
              <View className="gap-2">
                <Text className="font-jakarta-semibold text-sm text-on-surface-variant">
                  Radio de búsqueda
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {RADIUS_OPTIONS_KM.map((km) => {
                    const meters = `${km * 1000}`;
                    const selected = radiusMeters === meters;

                    return (
                      <TouchableOpacity
                        key={km}
                        onPress={() => setRadiusMeters(meters)}
                        className={`px-4 py-2 rounded-full border flex-row items-center gap-1.5 ${
                          selected
                            ? 'bg-primary border-primary'
                            : 'bg-surface-container-low border-outline-variant/40'
                        }`}
                        activeOpacity={0.75}
                      >
                        <MapPin size={14} color={selected ? '#ffffff' : Colors.outline} />
                        <Text
                          className={`font-jakarta-bold text-xs ${
                            selected ? 'text-white' : 'text-on-surface-variant'
                          }`}
                        >
                          {km} km
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <View className="gap-2">
                <Text className="font-jakarta-semibold text-sm text-on-surface-variant">
                  Ordenar por
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { value: 'nearest_pickup', label: 'Más cercano' },
                    { value: 'soonest', label: 'Más temprano' },
                    { value: 'lowest_price', label: 'Más barato' },
                    { value: 'most_seats', label: 'Asientos disponibles' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSortBy(option.value as typeof sortBy)}
                      className={`px-3 py-2 rounded-full border ${
                        sortBy === option.value
                          ? 'bg-primary border-primary'
                          : 'bg-surface-container-low border-outline-variant/40'
                      }`}
                    >
                      <Text
                        className={`font-jakarta-semibold text-xs ${
                          sortBy === option.value ? 'text-white' : 'text-on-surface-variant'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          <Button
            title={pickupPoint && destinationPoint ? 'Ver viajes' : 'Ver todos los viajes'}
            onPress={handleSearch}
            loading={loading}
            icon={<Search size={20} color="#ffffff" />}
            variant="primary"
          />
          <TouchableOpacity
            className="flex-row justify-center items-center gap-2 py-2"
            onPress={clearFilters}
            activeOpacity={0.7}
          >
            <X size={16} color={Colors.outline} />
            <Text className="font-jakarta-semibold text-xs text-outline">
              Limpiar filtros
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderResultsHeader = () => (
    <View className="px-5 pt-6 pb-4 gap-3">
      <View className="flex-row justify-between items-center">
        <Text className="font-jakarta-bold text-[30px] text-on-surface tracking-tight">
          Viajes
        </Text>
        <TouchableOpacity
          className="px-3 py-2 rounded-full bg-surface-container-low border border-outline-variant/30"
          onPress={() => setStep('filters')}
        >
          <Text className="font-jakarta-semibold text-xs text-on-surface-variant">
            Editar filtros
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between items-center px-1">
        <Text className="font-jakarta-semibold text-sm text-on-surface-variant">
          {pickupPoint && destinationPoint
            ? `${pickupPoint.placeName ?? 'Salida'} → ${destinationPoint.placeName ?? 'Llegada'}`
            : 'Mostrando todos los viajes disponibles'}
        </Text>
        <Text className="font-jakarta-medium text-xs text-outline">
          {rides.length} resultados
        </Text>
      </View>
      <Button
        title="Ver resultados en mapa"
        onPress={() => setShowMapResultsModal(true)}
        icon={<Route size={18} color={Colors.primary} />}
        variant="ghost"
      />
    </View>
  );

  const renderResultsFooter = () => {
    if (!rides.length) return null;

    if (loadingMore) {
      return (
        <LoadingState title="Cargando más viajes..." compact />
      );
    }

    if (!hasMore) return null;

    return (
      <View className="py-2">
        <Button
          title="Cargar más viajes"
          onPress={loadMoreRides}
          variant="ghost"
        />
      </View>
    );
  };

  const renderPickerModal = ({
    visible,
    title,
    mode,
    value,
    onChange,
    onCancel,
    onApply,
  }: {
    visible: boolean;
    title: string;
    mode: 'date' | 'time';
    value: Date;
    onChange: (_event: DateTimePickerEvent, selectedDate?: Date) => void;
    onCancel: () => void;
    onApply: () => void;
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-1">
          <View className="h-14 px-5 flex-row items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest">
            <Text className="font-jakarta-bold text-base text-on-surface">{title}</Text>
            <TouchableOpacity
              onPress={onCancel}
              className="w-9 h-9 rounded-full items-center justify-center bg-surface-container-low"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cerrar selector"
            >
              <X size={18} color={Colors.outline} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center px-5 py-6">
            <View className="bg-surface-container-low rounded-3xl px-2 py-3">
              <DateTimePicker
                value={value}
                mode={mode}
                is24Hour={mode === 'time'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChange}
              />
            </View>
          </View>

          <View className="px-5 pt-3 pb-4 border-t border-outline-variant/20 bg-surface-container-lowest">
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl items-center justify-center bg-surface-container-low border border-outline-variant/40"
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text className="font-jakarta-semibold text-sm text-on-surface-variant">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl items-center justify-center bg-primary"
                onPress={onApply}
                activeOpacity={0.8}
              >
                <Text className="font-jakarta-bold text-sm text-white">Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader />
      {step === 'filters' ? (
        renderFiltersScreen()
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RideCard ride={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: tabBarHeight + 24, gap: 16 }}
          ListHeaderComponent={renderResultsHeader}
          ListFooterComponent={renderResultsFooter}
          onEndReached={loadMoreRides}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            loading ? (
              <LoadingState
                title="Buscando viajes cercanos"
                message="Estamos revisando las rutas disponibles para tus filtros."
              />
            ) : (
              <EmptyState
                icon={<Search size={30} color={Colors.outline} />}
                title="No hay viajes disponibles"
                message="Prueba otra fecha, cambia la ruta o amplía el radio de búsqueda."
                actionLabel="Editar filtros"
                onAction={() => setStep('filters')}
              />
            )
          }
        />
      )}

      <RouteLocationPickerMap
        visible={routePickerVisible}
        initialOrigin={pickupPoint ?? undefined}
        initialDestination={destinationPoint ?? undefined}
        onClose={() => setRoutePickerVisible(false)}
        onConfirm={({ origin, destination }) => {
          setPickupPoint(origin);
          setDestinationPoint(destination);
          setRoutePickerVisible(false);
        }}
      />

      <RidesResultsMapModal
        visible={showMapResultsModal}
        rides={rides}
        onClose={() => setShowMapResultsModal(false)}
      />

      {renderPickerModal({
        visible: showDatePicker,
        title: 'Seleccionar fecha',
        mode: 'date',
        value: draftDate,
        onChange: handleDateChange,
        onCancel: () => setShowDatePicker(false),
        onApply: applyDate,
      })}

      {renderPickerModal({
        visible: showTimePicker,
        title: 'Seleccionar hora',
        mode: 'time',
        value: draftTime,
        onChange: handleTimeChange,
        onCancel: () => setShowTimePicker(false),
        onApply: applyTime,
      })}
    </SafeAreaView>
  );
}
