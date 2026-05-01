import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Colors, Shadows } from '../constants/theme';
import { decodePolyline, fetchDrivingRoute, RouteResult } from '../utils/maps';
import { OriginMarker, DestinationMarker } from './MapMarker';

interface RouteMapPreviewProps {
  origin: { latitude: number; longitude: number } | null;
  destination: { latitude: number; longitude: number } | null;
  /** Pre-fetched encoded polyline (e.g. from the DB). When provided the
   *  component skips the OSRM request entirely. */
  routePolyline?: string | null;
  height?: number;
  /** Called whenever a route is resolved (or cleared) internally. */
  onRouteResult?: (result: RouteResult | null) => void;
}

export function RouteMapPreview({
  origin,
  destination,
  routePolyline,
  height = 210,
  onRouteResult,
}: RouteMapPreviewProps) {
  const mapRef = useRef<MapView | null>(null);
  const [fetchedPolyline, setFetchedPolyline] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapLaidOut, setMapLaidOut] = useState(false);

  // Fetch a road-following route from OSRM when no pre-computed polyline is given.
  useEffect(() => {
    if (routePolyline) {
      // Parent supplied a real encoded polyline — skip the OSRM fetch.
      setFetchedPolyline(null);
      return;
    }
    if (!origin || !destination) {
      setFetchedPolyline(null);
      onRouteResult?.(null);
      return;
    }

    let cancelled = false;
    setFetching(true);

    fetchDrivingRoute(origin, destination).then((result) => {
      if (cancelled) return;
      setFetching(false);
      if (!result) {
        console.warn('[RouteMapPreview] Falling back to straight line: OSRM returned no route', {
          origin,
          destination,
        });
      }
      setFetchedPolyline(result?.polyline ?? null);
      onRouteResult?.(result);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
    routePolyline,
  ]);

  const activePolyline = routePolyline || fetchedPolyline;

  const routeCoordinates = useMemo(() => {
    if (!origin || !destination) return [];
    if (activePolyline) {
      const decoded = decodePolyline(activePolyline);
      if (decoded.length > 1) return decoded;
      console.warn('[RouteMapPreview] Falling back to straight line: invalid route polyline', {
        activePolylineLength: activePolyline.length,
        decodedPoints: decoded.length,
      });
    }
    return [];
  }, [origin, destination, activePolyline]);

  useEffect(() => {
    if (!origin || !destination || !mapReady || !mapLaidOut) return;

    const coordinates = routeCoordinates.length > 1
      ? routeCoordinates
      : [origin, destination];

    const handle = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coordinates, {
        animated: false,
        edgePadding: { top: 56, right: 56, bottom: 56, left: 56 },
      });
    }, 50);

    return () => clearTimeout(handle);
  }, [
    origin,
    destination,
    routeCoordinates,
    mapReady,
    mapLaidOut,
  ]);

  if (!origin || !destination) {
    return (
      <View
        className="rounded-[16px] border border-outline-variant/20 items-center justify-center bg-surface-container-low"
        style={{ height }}
      >
        <Text className="font-jakarta text-sm text-on-surface-variant">
          Selecciona origen y destino para ver el trayecto.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="rounded-[16px] overflow-hidden border border-outline-variant/20"
      style={[Shadows.sm, { height }]}
    >
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: 0.25,
          longitudeDelta: 0.25,
        }}
        onMapReady={() => setMapReady(true)}
        onLayout={() => setMapLaidOut(true)}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={origin} title="Salida" zIndex={2}>
          <OriginMarker />
        </Marker>
        <Marker coordinate={destination} title="Llegada" zIndex={3}>
          <DestinationMarker />
        </Marker>

        {routeCoordinates.length > 1 ? (
          // Decoded road-following route from OSRM.
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Colors.primary}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        ) : (
          // Dashed straight-line fallback while the route is loading (or unreachable).
          <Polyline
            coordinates={[origin, destination]}
            strokeColor={fetching ? Colors.outline : Colors.primary}
            strokeWidth={2}
            lineDashPattern={[8, 5]}
          />
        )}
      </MapView>
    </View>
  );
}
