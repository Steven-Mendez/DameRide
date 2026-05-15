import React from 'react';
import { View, Text } from 'react-native';

import DameRideLogo from '@/src/components/DameRideLogo';
import { Colors } from '@/src/constants/theme';

type BrandSplashProps = {
  /** Optional subtitle rendered beneath the wordmark in `Colors.onSurfaceVariant`. */
  subtitle?: string;
};

/**
 * Branded in-app loading splash.
 *
 * Renders a full-screen cream surface with the DameRide brand mark and
 * wordmark centred vertically. Used to fill the gap between native-splash
 * hide and the first navigable screen while auth is bootstrapping.
 *
 * Intentionally static — no spinner or animation. Renders the wordmark in
 * the project's Jakarta extrabold family so it must only be mounted after
 * fonts have finished loading.
 */
export default function BrandSplash({ subtitle }: BrandSplashProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
      }}
    >
      <DameRideLogo size={120} accessibilityLabel="DameRide" />
      <Text
        className="font-jakarta-extrabold text-center tracking-tight"
        style={{ color: Colors.primary, fontSize: 32, marginTop: 16 }}
      >
        DameRide
      </Text>
      {subtitle ? (
        <Text
          className="font-jakarta text-sm text-center"
          style={{ color: Colors.onSurfaceVariant, marginTop: 8 }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
