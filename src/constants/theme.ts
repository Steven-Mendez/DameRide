export const Colors = {
  // Primary
  primary: '#FF6B1A',
  primaryContainer: '#FFD7BF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#5A1F00',
  primaryFixed: '#FFD7BF',
  primaryFixedDim: '#FFB088',
  onPrimaryFixed: '#2B0E00',
  onPrimaryFixedVariant: '#5A1F00',
  inversePrimary: '#FFB088',

  // Secondary
  secondary: '#F5C518',
  secondaryContainer: '#FFEEB0',
  onSecondary: '#1A1300',
  onSecondaryContainer: '#3A2A00',
  secondaryFixed: '#FFEEB0',
  secondaryFixedDim: '#FFE07A',
  onSecondaryFixed: '#1A1300',
  onSecondaryFixedVariant: '#3A2A00',

  // Tertiary
  tertiary: '#8B4A1F',
  tertiaryContainer: '#FFD7BF',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#5A1F00',
  tertiaryFixed: '#FFD7BF',
  tertiaryFixedDim: '#FFB088',
  onTertiaryFixed: '#2B0E00',

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Surface / Background
  surface: '#F8F4EB',
  surfaceBright: '#FBF8F1',
  surfaceDim: '#E8E1D0',
  surfaceContainer: '#F2EDE0',
  surfaceContainerLow: '#FAF6EE',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerHigh: '#EBE5D4',
  surfaceContainerHighest: '#E4DCC8',
  surfaceTint: '#FF6B1A',
  surfaceVariant: '#EBE5D4',

  // On Surface
  onSurface: '#0F0F0F',
  onSurfaceVariant: '#3A3A3A',

  // Outline
  outline: '#7A7368',
  outlineVariant: '#D9D2C3',

  // Inverse
  inverseSurface: '#2A2622',
  inverseOnSurface: '#F8F4EB',

  // Background
  background: '#F8F4EB',
  onBackground: '#0F0F0F',

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
    shadowColor: '#FF6B1A',
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
