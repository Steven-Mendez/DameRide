import React from 'react';
import { Text, View } from 'react-native';
import { Shadows } from '../constants/theme';
import type { RouteResult } from '../utils/maps';

interface RouteMapPreviewProps {
  origin: { latitude: number; longitude: number } | null;
  destination: { latitude: number; longitude: number } | null;
  routePolyline?: string | null;
  height?: number;
  onRouteResult?: (result: RouteResult | null) => void;
}

export function RouteMapPreview({ origin, destination, height = 210, onRouteResult }: RouteMapPreviewProps) {
  React.useEffect(() => {
    onRouteResult?.(null);
  }, [origin, destination, onRouteResult]);

  return (
    <View
      className="rounded-[16px] border border-outline-variant/20 items-center justify-center bg-surface-container-low px-5"
      style={[Shadows.sm, { height }]}
    >
      <Text className="font-jakarta-semibold text-sm text-on-surface text-center">
        Vista previa de mapa disponible en iOS y Android.
      </Text>
      {origin && destination ? (
        <Text className="font-jakarta text-xs text-on-surface-variant text-center mt-2">
          Salida: {origin.latitude.toFixed(4)}, {origin.longitude.toFixed(4)} - Llegada: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
        </Text>
      ) : null}
    </View>
  );
}
