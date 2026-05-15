import React from 'react';
import Svg, { Circle, G, Mask, Path, Rect } from 'react-native-svg';

import { Colors } from '@/src/constants/theme';

type DameRideLogoProps = {
  /** Sets both width and height — the mark is square. */
  size: number;
  /** Fill color for the painted geometry. Defaults to the brand primary. */
  color?: string;
  /** Optional a11y label; when provided, the logo is announced to screen readers. */
  accessibilityLabel?: string;
};

/**
 * DameRide brand mark — rendered as inline SVG via `react-native-svg`.
 *
 * The painted geometry (car body, dome, smile, wheels) is filled with `color`
 * (default `Colors.primary`). The window and wheel arches are subtracted via a
 * `<Mask>` so they render as true transparent cutouts on any surface.
 *
 * Public API is preserved byte-for-byte: `{ size, color?, accessibilityLabel? }`.
 */
export default function DameRideLogo({
  size,
  color = Colors.primary,
  accessibilityLabel,
}: DameRideLogoProps) {
  const a11yProps = accessibilityLabel
    ? {
        accessible: true,
        accessibilityRole: 'image' as const,
        accessibilityLabel,
      }
    : { accessible: false };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="87 221 900 900"
      {...a11yProps}
    >
      <Mask
        id="dameRideCutouts"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1080"
        height="1350"
      >
        <Rect x="0" y="0" width="1080" height="1350" fill="#fff" />
        <Path d="M 370 510 A 168 145 0 0 1 706 510 Z" fill="#000" />
        <Path d="M 211 745 A 126 125 0 0 1 463 745 Z" fill="#000" />
        <Path d="M 610 745 A 126 125 0 0 1 862 745 Z" fill="#000" />
      </Mask>
      <G mask="url(#dameRideCutouts)">
        <Path
          d="M 290 505 L 786 505 C 870 505 948 580 948 660 L 948 745 L 126 745 L 126 660 C 126 580 206 505 290 505 Z"
          fill={color}
        />
        <Path d="M 303 510 A 235 208 0 0 1 773 510 Z" fill={color} />
      </G>
      <Circle cx="337" cy="743" r="71" fill={color} />
      <Circle cx="737" cy="743" r="72" fill={color} />
      <Path
        d="M 381 873 A 237 237 0 0 0 316 900 A 249 249 0 0 0 764 900 A 237 237 0 0 1 699 873 A 179 179 0 0 1 381 873 Z"
        fill={color}
      />
    </Svg>
  );
}
