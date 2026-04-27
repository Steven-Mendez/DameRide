export const Colors = {
  // Primary
  primary: '#006d37',
  primaryContainer: '#2ecc71',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#005027',
  primaryFixed: '#6bfe9c',
  primaryFixedDim: '#4ae183',
  onPrimaryFixed: '#00210c',
  onPrimaryFixedVariant: '#005228',
  inversePrimary: '#4ae183',

  // Secondary
  secondary: '#0051d3',
  secondaryContainer: '#226afc',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#fefcff',
  secondaryFixed: '#dbe1ff',
  secondaryFixedDim: '#b3c5ff',
  onSecondaryFixed: '#00174a',
  onSecondaryFixedVariant: '#003ea6',

  // Tertiary
  tertiary: '#98472a',
  tertiaryContainer: '#ff9875',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#772e14',
  tertiaryFixed: '#ffdbd0',
  tertiaryFixedDim: '#ffb59d',
  onTertiaryFixed: '#390c00',

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Surface / Background
  surface: '#f8f9fa',
  surfaceBright: '#f8f9fa',
  surfaceDim: '#d9dadb',
  surfaceContainer: '#edeeef',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#e7e8e9',
  surfaceContainerHighest: '#e1e3e4',
  surfaceTint: '#006d37',
  surfaceVariant: '#e1e3e4',

  // On Surface
  onSurface: '#191c1d',
  onSurfaceVariant: '#3d4a3e',

  // Outline
  outline: '#6c7b6d',
  outlineVariant: '#bbcbbb',

  // Inverse
  inverseSurface: '#2e3132',
  inverseOnSurface: '#f0f1f2',

  // Background
  background: '#f8f9fa',
  onBackground: '#191c1d',

  // Utility
  emerald50: '#ecfdf5',
  emerald600: '#059669',
  whatsappGreen: '#25D366',
  amber400: '#fbbf24',
  gray400: '#9ca3af',
  gray100: '#f3f4f6',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  container: 20,
  gutter: 12,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  card: 20,
  container: 24,
  full: 9999,
} as const;

/** Stitch ambient tonal depth shadows */
export const Shadows = {
  /** Floor-level: cards and containers */
  surface: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  /** Soft sm shadow */
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  /** Action-level: primary buttons, modals */
  action: {
    shadowColor: '#006d37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  /** Upward shadow for bottom bars */
  bottomBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
