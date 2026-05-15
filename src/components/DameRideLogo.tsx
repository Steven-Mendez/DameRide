import React from 'react';
import { Image } from 'react-native';

import { Colors } from '@/src/constants/theme';

type DameRideLogoProps = {
  /** Sets both width and height — the mark is square. */
  size: number;
  /** Tint applied to the monochrome PNG. Defaults to the brand primary. */
  color?: string;
  /** Optional a11y label; when provided, the image is announced to screen readers. */
  accessibilityLabel?: string;
};

/**
 * DameRide brand mark — renders the canonical PNG asset
 * (`assets/images/dame-ride-logo.png`).
 *
 * The PNG is monochrome, so `color` is applied via `tintColor` to recolor
 * the mark cleanly. Sized as a square via `size`.
 */
export default function DameRideLogo({
  size,
  color = Colors.primary,
  accessibilityLabel,
}: DameRideLogoProps) {
  return (
    <Image
      source={require('@/assets/images/dame-ride-logo.png')}
      style={{ width: size, height: size, tintColor: color }}
      resizeMode="contain"
      accessibilityRole="image"
      accessible={accessibilityLabel ? true : false}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
