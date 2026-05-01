import React from 'react';
import { View } from 'react-native';
import { Navigation2, MapPin } from 'lucide-react-native';
import { Colors } from '../constants/theme';

interface PinBubbleProps {
  color: string;
  children: React.ReactNode;
}

function PinBubble({ color, children }: PinBubbleProps) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          backgroundColor: color,
          borderRadius: 24,
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2.5,
          borderColor: '#ffffff',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 6,
        }}
      >
        {children}
      </View>
      {/* Downward triangle pointer */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 7,
          borderRightWidth: 7,
          borderTopWidth: 9,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
          marginTop: -1,
        }}
      />
    </View>
  );
}

interface MarkerProps {
  /** Override the default brand color — useful when showing multiple routes. */
  color?: string;
}

/** Green pin with a navigation arrow — used for trip origin / salida. */
export function OriginMarker({ color = Colors.primary }: MarkerProps) {
  return (
    <PinBubble color={color}>
      <Navigation2 size={18} color="#ffffff" fill="#ffffff" />
    </PinBubble>
  );
}

/** Blue pin with a map-pin icon — used for trip destination / llegada. */
export function DestinationMarker({ color = Colors.secondary }: MarkerProps) {
  return (
    <PinBubble color={color}>
      <MapPin size={18} color="#ffffff" fill="#ffffff" />
    </PinBubble>
  );
}

/**
 * Palette of visually distinct colors for multi-route maps.
 * Designed to be legible against both light and dark map tiles.
 */
export const ROUTE_PALETTE = [
  '#006d37', // verde (primary)
  '#0051d3', // azul (secondary)
  '#e8570a', // naranja
  '#7c3aed', // morado
  '#0d9488', // teal
  '#dc2626', // rojo
  '#b45309', // ámbar oscuro
  '#be185d', // rosa
] as const;

/** Returns the palette color for a given ride index (wraps around). */
export function rideColor(index: number): string {
  return ROUTE_PALETTE[index % ROUTE_PALETTE.length];
}
