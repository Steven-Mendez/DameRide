import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Polyline, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Crosshair, MapPin, Minus, Navigation, Plus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Colors, Shadows } from '../constants/theme';
import { decodePolyline, fetchDrivingRoute } from '../utils/maps';
import { OriginMarker, DestinationMarker } from './MapMarker';
import type { MapPointSelection } from '../types/database';
import type { Coordinate, RouteResult } from '../utils/maps';

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

const DEFAULT_REGION: Region = {
  latitude: 12.1328,
  longitude: -86.2504,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export function RouteLocationPickerMap({
  visible,
  initialOrigin,
  initialDestination,
  onConfirm,
  onClose,
}: RouteLocationPickerMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const insets = useSafeAreaInsets();
  const [origin, setOrigin] = useState<MapPointSelection | null>(initialOrigin ?? null);
  const [destination, setDestination] = useState<MapPointSelection | null>(initialDestination ?? null);
  const [activePoint, setActivePoint] = useState<'origin' | 'destination'>(
    initialOrigin && !initialDestination ? 'destination' : 'origin'
  );
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [fetchingRoute, setFetchingRoute] = useState(false);
  const lastRouteKeyRef = useRef<string | null>(null);
  const originLatitude = origin?.latitude;
  const originLongitude = origin?.longitude;
  const destinationLatitude = destination?.latitude;
  const destinationLongitude = destination?.longitude;

  useEffect(() => {
    if (!visible) return;
    setOrigin(initialOrigin ?? null);
    setDestination(initialDestination ?? null);
    setActivePoint(initialOrigin && !initialDestination ? 'destination' : 'origin');
    setRouteCoords([]);
    setRouteResult(null);
    lastRouteKeyRef.current = null;
  }, [visible, initialOrigin, initialDestination]);

  // Debounced OSRM route fetch whenever both points are defined.
  useEffect(() => {
    if (
      !visible ||
      originLatitude == null ||
      originLongitude == null ||
      destinationLatitude == null ||
      destinationLongitude == null
    ) {
      setRouteCoords([]);
      setRouteResult(null);
      setFetchingRoute(false);
      return;
    }

    const routeKey = [
      originLatitude.toFixed(6),
      originLongitude.toFixed(6),
      destinationLatitude.toFixed(6),
      destinationLongitude.toFixed(6),
    ].join(',');

    if (lastRouteKeyRef.current === routeKey && routeResult) {
      return;
    }

    setFetchingRoute(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const result = await fetchDrivingRoute(
        { latitude: originLatitude, longitude: originLongitude },
        { latitude: destinationLatitude, longitude: destinationLongitude },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      lastRouteKeyRef.current = routeKey;
      setRouteResult(result);
      if (result) {
        const decoded = decodePolyline(result.polyline);
        console.info('[RouteLocationPickerMap] Route resolved for picker', {
          routeKey,
          distanceMeters: Math.round(result.distanceMeters),
          durationSeconds: Math.round(result.durationSeconds),
          decodedPoints: decoded.length,
        });
        if (decoded.length <= 1) {
          console.warn('[RouteLocationPickerMap] Invalid route polyline', {
            polylineLength: result.polyline.length,
            decodedPoints: decoded.length,
          });
        }
        setRouteCoords(decoded);
      } else {
        console.warn('[RouteLocationPickerMap] Falling back to straight line: OSRM returned no route', {
          origin: { latitude: originLatitude, longitude: originLongitude },
          destination: { latitude: destinationLatitude, longitude: destinationLongitude },
          routeKey,
        });
        setRouteCoords([]);
      }
      setFetchingRoute(false);
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [visible, originLatitude, originLongitude, destinationLatitude, destinationLongitude, routeResult]);

  const initialRegion = useMemo(() => {
    if (origin) {
      return {
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
    }
    return DEFAULT_REGION;
  }, [origin]);

  const reverseGeocode = async (
    latitude: number,
    longitude: number,
    point: 'origin' | 'destination'
  ) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = results[0];
      const placeName = [place?.name, place?.street].filter(Boolean).join(', ');
      const address = [place?.district, place?.city, place?.region].filter(Boolean).join(', ');
      const payload: MapPointSelection = { latitude, longitude, placeName, address };
      if (point === 'origin') {
        setOrigin(payload);
      } else {
        setDestination(payload);
      }
    } catch {
      const payload: MapPointSelection = { latitude, longitude };
      if (point === 'origin') {
        setOrigin(payload);
      } else {
        setDestination(payload);
      }
    }
  };

  const setPoint = (latitude: number, longitude: number, point: 'origin' | 'destination') => {
    void reverseGeocode(latitude, longitude, point);
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPoint(latitude, longitude, activePoint);
    if (activePoint === 'origin' && !destination) {
      setActivePoint('destination');
    }
  };

  const centerToCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const current = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current?.animateToRegion(region, 250);
      setPoint(current.coords.latitude, current.coords.longitude, activePoint);
    } catch {
      // Keep current map state if geolocation fails.
    }
  };

  const zoomByFactor = (factor: number) => {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then((camera) => {
      if (!camera.center) return;
      const nextAltitude = Math.min(Math.max((camera.altitude ?? 1200) * factor, 120), 2000000);
      mapRef.current?.animateCamera(
        {
          center: camera.center,
          altitude: nextAltitude,
          heading: camera.heading,
          pitch: camera.pitch,
          zoom: camera.zoom,
        },
        { duration: 180 }
      );
    }).catch(() => {
      // Ignore camera read failures and keep map interactive.
    });
  };

  const canConfirm = Boolean(origin && destination);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View
          className="px-5 pb-4 flex-row items-center justify-between border-b border-outline-variant/30"
          style={{ paddingTop: Math.max(insets.top, 14) }}
        >
          <Text className="font-jakarta-bold text-lg text-on-surface">Seleccionar salida y llegada</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View className="px-5 py-3 gap-2 bg-surface-container-lowest">
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 rounded-full px-4 py-2 border ${
                activePoint === 'origin'
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-low border-outline-variant/40'
              }`}
              onPress={() => setActivePoint('origin')}
            >
              <Text className={`font-jakarta-semibold text-xs text-center ${activePoint === 'origin' ? 'text-white' : 'text-on-surface-variant'}`}>
                Punto de salida
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-full px-4 py-2 border ${
                activePoint === 'destination'
                  ? 'bg-secondary border-secondary'
                  : 'bg-surface-container-low border-outline-variant/40'
              }`}
              onPress={() => setActivePoint('destination')}
            >
              <Text className={`font-jakarta-semibold text-xs text-center ${activePoint === 'destination' ? 'text-white' : 'text-on-surface-variant'}`}>
                Punto de llegada
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="font-jakarta text-xs text-outline">
            {fetchingRoute
              ? 'Calculando ruta...'
              : `Toca el mapa para ubicar ${activePoint === 'origin' ? 'salida' : 'llegada'}.`}
          </Text>
        </View>

        <View className="flex-1">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            onPress={handleMapPress}
            zoomEnabled
            scrollEnabled
          >
            {origin && (
              <Marker
                coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
                title="Salida"
                draggable
                onDragEnd={(event) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setPoint(latitude, longitude, 'origin');
                }}
              >
                <OriginMarker />
              </Marker>
            )}
            {destination && (
              <Marker
                coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
                title="Llegada"
                draggable
                onDragEnd={(event) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setPoint(latitude, longitude, 'destination');
                }}
              >
                <DestinationMarker />
              </Marker>
            )}

            {routeCoords.length > 1 ? (
              <Polyline
                coordinates={routeCoords}
                strokeColor={Colors.primary}
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            ) : (
              origin && destination && (
                <Polyline
                  coordinates={[
                    { latitude: origin.latitude, longitude: origin.longitude },
                    { latitude: destination.latitude, longitude: destination.longitude },
                  ]}
                  strokeColor={Colors.outline}
                  strokeWidth={2}
                  lineDashPattern={[8, 5]}
                />
              )
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
              onPress={() => zoomByFactor(0.7)}
              activeOpacity={0.8}
            >
              <Plus size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white rounded-full p-3"
              style={Shadows.surface}
              onPress={() => zoomByFactor(1.4)}
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
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Navigation size={16} color={Colors.primary} />
              <Text className="font-jakarta-semibold text-xs text-on-surface-variant">
                Salida: {origin?.placeName ?? 'Sin seleccionar'}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <MapPin size={16} color={Colors.secondary} />
              <Text className="font-jakarta-semibold text-xs text-on-surface-variant">
                Llegada: {destination?.placeName ?? 'Sin seleccionar'}
              </Text>
            </View>
          </View>
          <Button
            title="Confirmar ruta"
            disabled={!canConfirm}
            onPress={() => {
              if (!origin || !destination) return;
              onConfirm({ origin, destination, routeResult });
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
