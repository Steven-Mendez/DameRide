import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { Minus, Plus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/theme';
import { decodePolyline, fetchDrivingRoute } from '../utils/maps';
import { OriginMarker, DestinationMarker, rideColor } from './MapMarker';
import type { Coordinate } from '../utils/maps';
import type { RideWithDriver } from '../types/database';

interface RidesResultsMapModalProps {
  visible: boolean;
  rides: RideWithDriver[];
  onClose: () => void;
}

const FALLBACK_REGION: Region = {
  latitude: 12.1328,
  longitude: -86.2504,
  latitudeDelta: 0.65,
  longitudeDelta: 0.65,
};

const ROUTE_FETCH_CONCURRENCY = 4;
const MAP_RIDES_BATCH_SIZE = 20;

interface CachedRoute {
  key: string;
  coords: Coordinate[];
}

function getRideRouteKey(ride: RideWithDriver) {
  return [
    ride.id,
    ride.origin_lat,
    ride.origin_lng,
    ride.destination_lat,
    ride.destination_lng,
    ride.route_polyline ?? '',
  ].join(':');
}

export function RidesResultsMapModal({ visible, rides, onClose }: RidesResultsMapModalProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const zoomControlsTop = Math.max(insets.top, 14) + 58;
  const [visibleRideCount, setVisibleRideCount] = useState(MAP_RIDES_BATCH_SIZE);

  /** Map from ride.id → decoded coordinate array for its road-following route. */
  const [rideRoutes, setRideRoutes] = useState<Record<string, CachedRoute>>({});
  const [pendingRouteFetches, setPendingRouteFetches] = useState<Record<string, true>>({});
  const rideRoutesRef = useRef<Record<string, CachedRoute>>({});
  const routeFetchFailuresRef = useRef<Record<string, true>>({});
  const pendingRouteFetchesRef = useRef<Record<string, true>>({});

  const uniqueRides = useMemo(() => {
    const seen = new Set<string>();
    return rides.filter((ride) => {
      if (seen.has(ride.id)) return false;
      seen.add(ride.id);
      return true;
    });
  }, [rides]);

  const mapRides = useMemo(
    () => uniqueRides.slice(0, visibleRideCount),
    [uniqueRides, visibleRideCount]
  );

  const mapRouteSignature = useMemo(
    () => mapRides.map(getRideRouteKey).join('|'),
    [mapRides]
  );

  useEffect(() => {
    if (visible) setVisibleRideCount(MAP_RIDES_BATCH_SIZE);
  }, [visible, rides]);

  const pendingRouteCount = Object.keys(pendingRouteFetches).length;
  const canLoadMoreMapRides = mapRides.length < uniqueRides.length;

  const coordinates = useMemo(
    () =>
      mapRides.flatMap((ride) => {
        const points: { latitude: number; longitude: number }[] = [];
        if (ride.origin_lat != null && ride.origin_lng != null) {
          points.push({ latitude: ride.origin_lat, longitude: ride.origin_lng });
        }
        if (ride.destination_lat != null && ride.destination_lng != null) {
          points.push({ latitude: ride.destination_lat, longitude: ride.destination_lng });
        }
        return points;
      }),
    [mapRides]
  );

  const initialRegion = useMemo(() => {
    const first = coordinates[0];
    if (!first) return FALLBACK_REGION;
    return {
      latitude: first.latitude,
      longitude: first.longitude,
      latitudeDelta: 0.4,
      longitudeDelta: 0.4,
    };
  }, [coordinates]);

  useEffect(() => {
    if (!visible || coordinates.length <= 1) return;

    mapRef.current?.fitToCoordinates(coordinates, {
      animated: true,
      edgePadding: { top: 80, right: 60, bottom: 160, left: 60 },
    });
  }, [visible, coordinates]);

  // Fetch road-following routes only for the currently visible map batch.
  useEffect(() => {
    if (!visible || !mapRides.length) return;

    const eligible = mapRides
      .filter(
        (r) =>
          r.origin_lat != null &&
          r.origin_lng != null &&
          r.destination_lat != null &&
          r.destination_lng != null
      );

    const missingRoutes = eligible.filter((ride) => {
      const key = getRideRouteKey(ride);
      return (
        rideRoutesRef.current[ride.id]?.key !== key &&
        !routeFetchFailuresRef.current[key] &&
        !pendingRouteFetchesRef.current[key]
      );
    });

    if (!missingRoutes.length) return;

    let cancelled = false;

    for (const ride of missingRoutes) {
      pendingRouteFetchesRef.current[getRideRouteKey(ride)] = true;
    }
    setPendingRouteFetches({ ...pendingRouteFetchesRef.current });

    const loadRoutes = async () => {
      let nextIndex = 0;
      const workers = Array.from(
        { length: Math.min(ROUTE_FETCH_CONCURRENCY, missingRoutes.length) },
        async () => {
          while (!cancelled) {
            const ride = missingRoutes[nextIndex];
            nextIndex += 1;
            if (!ride) return;

            const key = getRideRouteKey(ride);

            try {
              let coords: Coordinate[] = [];

              // Prefer a polyline already stored in the DB.
              if (ride.route_polyline) {
                coords = decodePolyline(ride.route_polyline);
                console.info('[RidesResultsMapModal] Decoded stored ride polyline', {
                  rideId: ride.id,
                  origin: ride.origin,
                  destination: ride.destination,
                  polylineLength: ride.route_polyline.length,
                  decodedPoints: coords.length,
                });
              }

              if (coords.length <= 1) {
                console.info('[RidesResultsMapModal] Fetching missing ride route', {
                  rideId: ride.id,
                  origin: ride.origin,
                  destination: ride.destination,
                });
                const result = await fetchDrivingRoute(
                  { latitude: ride.origin_lat!, longitude: ride.origin_lng! },
                  { latitude: ride.destination_lat!, longitude: ride.destination_lng! },
                );
                coords = result ? decodePolyline(result.polyline) : [];
                console.info('[RidesResultsMapModal] Fetched ride route result', {
                  rideId: ride.id,
                  hasResult: Boolean(result),
                  decodedPoints: coords.length,
                });
              }

              if (cancelled) return;

              if (coords.length > 1) {
                rideRoutesRef.current = {
                  ...rideRoutesRef.current,
                  [ride.id]: { key, coords },
                };
                setRideRoutes({ ...rideRoutesRef.current });
              } else {
                routeFetchFailuresRef.current = {
                  ...routeFetchFailuresRef.current,
                  [key]: true,
                };
              }
            } catch {
              routeFetchFailuresRef.current = {
                ...routeFetchFailuresRef.current,
                [key]: true,
              };
            } finally {
              if (cancelled) return;
              delete pendingRouteFetchesRef.current[key];
              setPendingRouteFetches({ ...pendingRouteFetchesRef.current });
            }
          }
        }
      );

      await Promise.all(workers);
      if (cancelled) return;

      for (const ride of missingRoutes) {
        delete pendingRouteFetchesRef.current[getRideRouteKey(ride)];
      }

      setRideRoutes({ ...rideRoutesRef.current });
      setPendingRouteFetches({ ...pendingRouteFetchesRef.current });
    };

    loadRoutes();

    const pendingRoutes = pendingRouteFetchesRef.current;

    return () => {
      cancelled = true;
      for (const ride of missingRoutes) {
        delete pendingRoutes[getRideRouteKey(ride)];
      }
      setPendingRouteFetches({ ...pendingRoutes });
    };
    // Depend on the stable route signature instead of the mapRides array identity.
    // Parent rerenders can recreate the rides array while the visible route set is unchanged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mapRouteSignature]);

  const loadMoreMapRides = () => {
    if (!canLoadMoreMapRides || pendingRouteCount > 0) return;
    setVisibleRideCount((current) => Math.min(current + MAP_RIDES_BATCH_SIZE, uniqueRides.length));
  };

  const zoomByFactor = (factor: number) => {
    mapRef.current?.getCamera().then((camera) => {
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
      // Keep map interactive even if camera read fails.
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View
          className="px-5 pb-4 flex-row items-center justify-between border-b border-outline-variant/30 bg-white"
          style={{ paddingTop: Math.max(insets.top, 14) }}
        >
          <Text className="font-jakarta-bold text-lg text-on-surface">Mapa de viajes</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          zoomEnabled
          scrollEnabled
          rotateEnabled
          pitchEnabled
          onMapReady={() => {
            if (coordinates.length > 1) {
              mapRef.current?.fitToCoordinates(coordinates, {
                animated: false,
                edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
              });
            }
          }}
        >
          {mapRides.map((ride, index) => {
            const color = rideColor(index);
            const routeDesc = `${ride.origin} → ${ride.destination} · C$${ride.price_cordobas}`;
            const routeKey = getRideRouteKey(ride);
            const routeCoords = rideRoutes[ride.id]?.key === routeKey ? rideRoutes[ride.id].coords : undefined;
            const isRoutePending = Boolean(pendingRouteFetches[routeKey]);
            const didRouteFail = Boolean(routeFetchFailuresRef.current[routeKey]);
            return (
              <React.Fragment key={ride.id}>
                {/* Road-following polyline; avoid misleading straight lines while loading. */}
                {ride.origin_lat != null &&
                  ride.origin_lng != null &&
                  ride.destination_lat != null &&
                  ride.destination_lng != null && (
                    routeCoords && routeCoords.length > 1 ? (
                      <Polyline
                        coordinates={routeCoords}
                        strokeColor={color}
                        strokeWidth={3}
                        lineCap="round"
                        lineJoin="round"
                      />
                    ) : didRouteFail && !isRoutePending ? (
                      <Polyline
                        coordinates={[
                          { latitude: ride.origin_lat, longitude: ride.origin_lng },
                          { latitude: ride.destination_lat, longitude: ride.destination_lng },
                        ]}
                        strokeColor={color}
                        strokeWidth={2}
                        lineDashPattern={[8, 5]}
                      />
                    ) : null
                    )
                  }

                {ride.origin_lat != null && ride.origin_lng != null && (
                  <Marker
                    coordinate={{ latitude: ride.origin_lat, longitude: ride.origin_lng }}
                    title={`Salida: ${ride.origin_place_name ?? ride.origin}`}
                    description={routeDesc}
                    tracksViewChanges={false}
                  >
                    <OriginMarker color={color} />
                  </Marker>
                )}
                {ride.destination_lat != null && ride.destination_lng != null && (
                  <Marker
                    coordinate={{ latitude: ride.destination_lat, longitude: ride.destination_lng }}
                    title={`Destino: ${ride.destination_place_name ?? ride.destination}`}
                    description={routeDesc}
                    tracksViewChanges={false}
                  >
                    <DestinationMarker color={color} />
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
        </MapView>

        <View className="absolute right-4 gap-2" style={{ top: zoomControlsTop }}>
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

        <View
          className="absolute left-4 right-4 bg-white rounded-xl px-4 py-3"
          style={[Shadows.surface, { bottom: Math.max(insets.bottom, 8) + 8 }]}
        >
          <Text className="font-jakarta-semibold text-sm text-on-surface">
            Mostrando {mapRides.length} de {uniqueRides.length} viajes cargados
          </Text>
          <Text className="font-jakarta text-xs text-on-surface-variant mt-1">
            Flecha: salida · Pin: destino · Cada color es un viaje distinto
          </Text>
          {pendingRouteCount > 0 && (
            <Text className="font-jakarta text-xs text-on-surface-variant mt-1">
              Calculando {pendingRouteCount} rutas por carretera...
            </Text>
          )}
          {canLoadMoreMapRides && (
            <TouchableOpacity
              className={`mt-3 h-11 rounded-xl items-center justify-center ${pendingRouteCount > 0 ? 'bg-surface-container-low' : 'bg-primary'}`}
              onPress={loadMoreMapRides}
              activeOpacity={0.8}
              disabled={pendingRouteCount > 0}
            >
              <Text className={`font-jakarta-bold text-sm ${pendingRouteCount > 0 ? 'text-on-surface-variant' : 'text-white'}`}>
                {pendingRouteCount > 0 ? 'Cargando rutas...' : 'Cargar más en mapa'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
