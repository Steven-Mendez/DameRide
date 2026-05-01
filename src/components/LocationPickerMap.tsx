import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Crosshair, MapPin, Minus, Plus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Colors, Shadows } from '../constants/theme';
import type { MapPointSelection } from '../types/database';

interface LocationPickerMapProps {
  visible: boolean;
  title: string;
  confirmLabel?: string;
  initialValue?: MapPointSelection;
  onConfirm: (selection: MapPointSelection) => void;
  onClose: () => void;
}

const NICARAGUA_REGION: Region = {
  latitude: 12.1328,
  longitude: -86.2504,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const SELECTED_POINT_DELTA = 0.015;

export function LocationPickerMap({
  visible,
  title,
  confirmLabel = 'Confirmar ubicación',
  initialValue,
  onConfirm,
  onClose,
}: LocationPickerMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<MapPointSelection | null>(initialValue ?? null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>(
    initialValue
      ? {
          latitude: initialValue.latitude,
          longitude: initialValue.longitude,
          latitudeDelta: SELECTED_POINT_DELTA,
          longitudeDelta: SELECTED_POINT_DELTA,
        }
      : NICARAGUA_REGION
  );

  useEffect(() => {
    if (visible) {
      setSelected(initialValue ?? null);
      setMapRegion(
        initialValue
          ? {
              latitude: initialValue.latitude,
              longitude: initialValue.longitude,
              latitudeDelta: SELECTED_POINT_DELTA,
              longitudeDelta: SELECTED_POINT_DELTA,
            }
          : NICARAGUA_REGION
      );
    }
  }, [visible, initialValue]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setLoadingAddress(true);
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = results[0];
      if (!place) return;

      const placeName = [
        place.name,
        place.street,
      ].filter(Boolean).join(', ');
      const address = [
        place.district,
        place.city,
        place.region,
      ].filter(Boolean).join(', ');

      setSelected((current) => {
        if (!current) return current;
        return {
          ...current,
          placeName: placeName || current.placeName,
          address: address || current.address,
        };
      });
    } catch {
      // If reverse geocoding is unavailable, we keep coordinates only.
    } finally {
      setLoadingAddress(false);
    }
  };

  const updateSelection = (latitude: number, longitude: number) => {
    setSelected({
      latitude,
      longitude,
    });
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: Math.max(mapRegion.latitudeDelta, SELECTED_POINT_DELTA),
        longitudeDelta: Math.max(mapRegion.longitudeDelta, SELECTED_POINT_DELTA),
      },
      250
    );
    reverseGeocode(latitude, longitude);
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    updateSelection(latitude, longitude);
  };

  const centerToCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const current = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: SELECTED_POINT_DELTA,
        longitudeDelta: SELECTED_POINT_DELTA,
      };
      setMapRegion(region);
      mapRef.current?.animateToRegion(region, 250);
      updateSelection(current.coords.latitude, current.coords.longitude);
    } catch {
      // We silently keep the default map center if geolocation fails.
    }
  };

  const zoomByFactor = (factor: number) => {
    const nextRegion: Region = {
      ...mapRegion,
      latitudeDelta: Math.min(Math.max(mapRegion.latitudeDelta * factor, 0.005), 4),
      longitudeDelta: Math.min(Math.max(mapRegion.longitudeDelta * factor, 0.005), 4),
    };
    setMapRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 200);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View
          className="px-5 pb-4 flex-row items-center justify-between border-b border-outline-variant/30"
          style={{ paddingTop: Math.max(insets.top, 14) }}
        >
          <Text className="font-jakarta-bold text-lg text-on-surface">{title}</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            onPress={handleMapPress}
            onRegionChangeComplete={setMapRegion}
            zoomEnabled
            zoomControlEnabled
            scrollEnabled
            rotateEnabled
            pitchEnabled
          >
            {selected && (
              <Marker
                coordinate={{ latitude: selected.latitude, longitude: selected.longitude }}
                draggable
                onDragEnd={(event) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  updateSelection(latitude, longitude);
                }}
              />
            )}
          </MapView>

          <TouchableOpacity
            className="absolute right-4 top-4 bg-white rounded-full p-3"
            style={Shadows.surface}
            onPress={centerToCurrentLocation}
            activeOpacity={0.8}
          >
            <Crosshair size={18} color={Colors.primary} />
          </TouchableOpacity>

          <View className="absolute right-4 top-20 gap-2">
            <TouchableOpacity
              className="bg-white rounded-full p-3"
              style={Shadows.surface}
              onPress={() => zoomByFactor(0.6)}
              activeOpacity={0.8}
            >
              <Plus size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white rounded-full p-3"
              style={Shadows.surface}
              onPress={() => zoomByFactor(1.6)}
              activeOpacity={0.8}
            >
              <Minus size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          className="px-5 pt-4 gap-3 bg-surface-container-lowest border-t border-outline-variant/20"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row gap-3 items-start">
            <MapPin size={18} color={Colors.primary} />
            <View className="flex-1">
              {selected ? (
                <>
                  <Text className="font-jakarta-semibold text-sm text-on-surface">
                    {selected.placeName ?? 'Punto seleccionado'}
                  </Text>
                  {!!selected.address && (
                    <Text className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                      {selected.address}
                    </Text>
                  )}
                  <Text className="font-jakarta text-xs text-outline mt-0.5">
                    {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}
                  </Text>
                  {loadingAddress && (
                    <Text className="font-jakarta text-xs text-outline mt-1">
                      Buscando nombre del lugar...
                    </Text>
                  )}
                </>
              ) : (
                <Text className="font-jakarta text-sm text-outline">
                  Toca el mapa o arrastra el pin para seleccionar.
                </Text>
              )}
            </View>
          </View>

          <Button
            title={confirmLabel}
            disabled={!selected}
            onPress={() => selected && onConfirm(selected)}
          />
        </View>
      </View>
    </Modal>
  );
}
