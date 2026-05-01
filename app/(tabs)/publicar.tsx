import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MapPin, Flag, Calendar, Clock, Map, CheckCircle, Route, ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { RouteMapPreview } from '@/src/components/RouteMapPreview';
import { RouteLocationPickerMap } from '@/src/components/RouteLocationPickerMap';
import { useAuth } from '@/src/hooks/useAuth';
import { createRide, getVehiclesByOwner } from '@/src/lib/database';
import { NICARAGUAN_CITIES } from '@/src/constants/routes';
import { Colors, Shadows } from '@/src/constants/theme';
import type { RouteResult } from '@/src/utils/maps';
import type { MapPointSelection, Vehicle } from '@/src/types/database';

export default function PublicarScreen() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originPoint, setOriginPoint] = useState<MapPointSelection | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<MapPointSelection | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [notes, setNotes] = useState('');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [step, setStep] = useState<'route' | 'details'>('route');
  const [routePickerVisible, setRoutePickerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [draftDate, setDraftDate] = useState(new Date());
  const [draftTime, setDraftTime] = useState(new Date());

  useEffect(() => {
    if (user) {
      getVehiclesByOwner(user.id).then(setVehicles);
    }
  }, [user]);

  const handlePublish = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para publicar un viaje.');
      return;
    }
    if (!origin || !destination || !date || !time) {
      Alert.alert('Error', 'Completa ciudad de origen, destino, fecha y hora.');
      return;
    }
    if (!originPoint || !destinationPoint) {
      Alert.alert('Error', 'Selecciona en mapa el punto exacto de salida y llegada.');
      return;
    }

    setLoading(true);

    // Parse date and time into ISO string
    const departureTime = new Date(`${date}T${time}:00`).toISOString();

    const { error } = await createRide({
      driver_id: user.id,
      vehicle_id: vehicles[0]?.id,
      origin: origin.trim(),
      origin_place_name: originPoint.placeName,
      origin_address: originPoint.address,
      origin_lat: originPoint.latitude,
      origin_lng: originPoint.longitude,
      destination: destination.trim(),
      destination_place_name: destinationPoint.placeName,
      destination_address: destinationPoint.address,
      destination_lat: destinationPoint.latitude,
      destination_lng: destinationPoint.longitude,
      route_polyline: routeResult?.polyline,
      route_distance_meters: routeResult ? Math.round(routeResult.distanceMeters) : undefined,
      route_duration_seconds: routeResult ? Math.round(routeResult.durationSeconds) : undefined,
      meeting_point: meetingPoint.trim() || undefined,
      departure_time: departureTime,
      available_seats: seats,
      price_cordobas: parseInt(price) || 0,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSuccess(true);
      // Reset form
      setOrigin('');
      setDestination('');
      setOriginPoint(null);
      setDestinationPoint(null);
      setDate('');
      setTime('');
      setSeats(3);
      setPrice('');
      setMeetingPoint('');
      setNotes('');
      setRouteResult(null);
      setStep('route');
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const goToDetailsStep = () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert('Completa la ruta', 'Ingresa ciudad de origen y destino.');
      return;
    }
    if (!originPoint || !destinationPoint) {
      Alert.alert('Ruta incompleta', 'Selecciona salida y llegada exactas en el mapa.');
      return;
    }
    if (!date.trim() || !time.trim()) {
      Alert.alert('Fecha y hora', 'Selecciona fecha y hora de salida.');
      return;
    }
    setStep('details');
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


  const inferCityFromPoint = (point: MapPointSelection): string | null => {
    const source = `${point.placeName ?? ''} ${point.address ?? ''}`.toLowerCase();
    const normalizedSource = source.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const hit = NICARAGUAN_CITIES.find((city) =>
      normalizedSource.includes(city.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))
      || source.includes(city.toLowerCase())
    );
    return hit ?? null;
  };

  const resolveCityFromPoint = (point: MapPointSelection): string => {
    return inferCityFromPoint(point)
      ?? point.address?.split(',').find(Boolean)?.trim()
      ?? point.placeName?.split(',').find(Boolean)?.trim()
      ?? 'Nicaragua';
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <AppHeader />

          <View className="px-5 py-6">
            <Text className="font-jakarta-bold text-[30px] text-on-surface mb-1 tracking-tight">
              Publicar Viaje
            </Text>
            <Text className="font-jakarta text-base text-on-surface-variant mb-6">
              Comparte tu ruta y ayuda a otros a llegar a su destino mientras ahorras.
            </Text>

            <View className="flex-row gap-2 mb-5">
              <View className={`flex-1 h-1.5 rounded-full ${step === 'route' ? 'bg-primary' : 'bg-primary/40'}`} />
              <View className={`flex-1 h-1.5 rounded-full ${step === 'details' ? 'bg-primary' : 'bg-primary/20'}`} />
            </View>

            {step === 'route' ? (
              <View className="gap-5">
                <View
                  className="bg-surface-container-lowest p-5 rounded-[20px] border border-outline-variant/20 gap-3"
                  style={Shadows.sm}
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
                        {originPoint && destinationPoint
                          ? `${originPoint.placeName ?? 'Salida'} → ${destinationPoint.placeName ?? 'Llegada'}`
                          : 'Toca para seleccionar la ruta en mapa'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View className="gap-1">
                    <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1 mb-1">
                      Ciudad de origen
                    </Text>
                    <View className="h-14 bg-surface-container-low rounded-input px-4 flex-row items-center gap-3">
                      <MapPin size={20} color={Colors.primary} />
                      <Text className={`font-jakarta text-base ${origin ? 'text-on-surface' : 'text-outline'}`}>
                        {origin || 'Seleccionar desde el mapa'}
                      </Text>
                    </View>
                  </View>
                  <View className="ml-6 h-5 border-l-2 border-dashed border-outline-variant" />
                  <View className="gap-1">
                    <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1 mb-1">
                      Ciudad de destino
                    </Text>
                    <View className="h-14 bg-surface-container-low rounded-input px-4 flex-row items-center gap-3">
                      <Flag size={20} color={Colors.secondary} />
                      <Text className={`font-jakarta text-base ${destination ? 'text-on-surface' : 'text-outline'}`}>
                        {destination || 'Seleccionar desde el mapa'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="gap-3">
                  <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1">
                    Ver trayecto
                  </Text>
                  <RouteMapPreview
                    origin={originPoint ? { latitude: originPoint.latitude, longitude: originPoint.longitude } : null}
                    destination={destinationPoint ? { latitude: destinationPoint.latitude, longitude: destinationPoint.longitude } : null}
                    routePolyline={routeResult?.polyline ?? null}
                    onRouteResult={setRouteResult}
                  />
                  {routeResult && (
                    <Text className="font-jakarta text-xs text-on-surface-variant px-1">
                      {(routeResult.distanceMeters / 1000).toFixed(1)} km · {Math.round(routeResult.durationSeconds / 60)} min estimados
                    </Text>
                  )}
                </View>

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
                      <Text className={`font-jakarta text-base ${date ? 'text-on-surface' : 'text-outline'}`}>
                        {date || 'Seleccionar fecha'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-1">
                    <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1 mb-2">
                      Hora de salida
                    </Text>
                    <TouchableOpacity
                      className="h-14 bg-surface-container-low rounded-input px-4 flex-row items-center gap-3"
                      activeOpacity={0.7}
                      onPress={openTimePicker}
                    >
                      <Clock size={20} color={Colors.outline} />
                      <Text className={`font-jakarta text-base ${time ? 'text-on-surface' : 'text-outline'}`}>
                        {time || 'Seleccionar hora'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  title="Continuar"
                  onPress={goToDetailsStep}
                  icon={<ArrowRight size={20} color={Colors.onPrimary} />}
                  variant="primary-container"
                />
              </View>
            ) : (
              <View className="gap-5">
                <View
                  className="bg-surface-container-lowest p-5 rounded-[20px] border border-outline-variant/20 gap-2"
                  style={Shadows.sm}
                >
                  <Text className="font-jakarta-semibold text-sm text-on-surface-variant">Ruta seleccionada</Text>
                  <Text className="font-jakarta-bold text-base text-on-surface">
                    {origin || 'Origen'} → {destination || 'Destino'}
                  </Text>
                  <Text className="font-jakarta text-xs text-outline">
                    {date || 'Sin fecha'} • {time || 'Sin hora'}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1 mb-2">
                      Asientos
                    </Text>
                    <View className="h-14 bg-surface-container-low rounded-input flex-row items-center px-3">
                      <Button
                        title="−"
                        size="sm"
                        variant="ghost"
                        onPress={() => setSeats(Math.max(1, seats - 1))}
                      />
                      <Text className="flex-1 text-center font-jakarta-bold text-xl text-on-surface">
                        {seats}
                      </Text>
                      <Button
                        title="+"
                        size="sm"
                        variant="ghost"
                        onPress={() => setSeats(Math.min(7, seats + 1))}
                      />
                    </View>
                  </View>
                  <View className="flex-1">
                    <Input
                      label="Precio sugerido"
                      placeholder="0.00"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      icon={
                        <Text className="font-jakarta-bold text-sm text-on-surface-variant">
                          C$
                        </Text>
                      }
                    />
                  </View>
                </View>

                <Input
                  label="Punto de encuentro"
                  placeholder="Punto de encuentro (opcional)"
                  value={meetingPoint}
                  onChangeText={setMeetingPoint}
                  icon={<Map size={20} color={Colors.outline} />}
                />

                <View className="gap-2">
                  <Text className="font-jakarta-semibold text-sm text-on-surface-variant ml-1">
                    Notas adicionales
                  </Text>
                  <TextInput
                    className="p-4 bg-surface-container-low rounded-input font-jakarta text-base text-on-surface min-h-[100px]"
                    placeholder="Ej. No se permite fumar, espacio para equipaje pequeño..."
                    placeholderTextColor="#6c7b6d"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button
                      title="Volver"
                      onPress={() => setStep('route')}
                      icon={<ArrowLeft size={18} color={Colors.onSurfaceVariant} />}
                      variant="ghost"
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      title="Publicar viaje"
                      onPress={handlePublish}
                      loading={loading}
                      icon={<CheckCircle size={20} color={Colors.onPrimary} />}
                      variant="primary"
                    />
                  </View>
                </View>

                {success && (
                  <View
                    className="flex-row items-center gap-3 p-4 bg-primary-container/10 border border-primary-container/30 rounded-xl"
                    style={Shadows.sm}
                  >
                    <CheckCircle size={20} color={Colors.primary} />
                    <Text className="font-jakarta-semibold text-sm text-on-primary-container flex-1">
                      Viaje publicado con éxito. ¡Buen viaje!
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <RouteLocationPickerMap
        visible={routePickerVisible}
        initialOrigin={originPoint ?? undefined}
        initialDestination={destinationPoint ?? undefined}
        onClose={() => setRoutePickerVisible(false)}
        onConfirm={({ origin: selectedOrigin, destination: selectedDestination, routeResult: selectedRouteResult }) => {
          setOriginPoint(selectedOrigin);
          setDestinationPoint(selectedDestination);
          setRouteResult(selectedRouteResult);
          setOrigin(resolveCityFromPoint(selectedOrigin));
          setDestination(resolveCityFromPoint(selectedDestination));
          if (!meetingPoint.trim()) {
            setMeetingPoint(selectedOrigin.placeName ?? '');
          }
          setRoutePickerVisible(false);
        }}
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
