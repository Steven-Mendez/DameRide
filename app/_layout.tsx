import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/src/hooks/useAuth';
import BrandSplash from '@/src/components/BrandSplash';
import '../global.css';

let splashScreenHidden = false;

function isUnregisteredNativeSplashError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes('No native splash screen registered for given view controller')
  );
}

async function hideSplashScreenOnce() {
  if (splashScreenHidden) return;

  try {
    await SplashScreen.hideAsync();
  } catch (error) {
    if (!isUnregisteredNativeSplashError(error)) {
      console.warn('Failed to hide splash screen', error);
    }
  } finally {
    splashScreenHidden = true;
  }
}

void SplashScreen.preventAutoHideAsync().catch(() => {
  // In Expo Go / fast refresh this can be called multiple times safely.
});

function RootLayoutNav() {
  const { session, profile, loading, profileLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // expo-router 6 / SDK 54: the root navigation state is `undefined` until the
  // root <NavigationContainer> is initialized. Guarding imperative redirects on
  // `navigationState?.key` ensures a navigator exists before any router.replace
  // is dispatched, so the action is never "not handled by any navigator".
  const navigationState = useRootNavigationState();
  const navigationReady = navigationState?.key != null;

  // Keep the splash up until the redirect can actually fire. While
  // `!navigationReady`, the readiness-gated effect cannot dispatch
  // router.replace yet, so hiding the overlay here would briefly expose the
  // `index` route before the redirect lands. This cannot deadlock: the <Stack>
  // is rendered unconditionally, so useRootNavigationState() resolves a key and
  // navigationReady becomes true on its own.
  const showSplash = loading || profileLoading || !navigationReady;

  useEffect(() => {
    // Single source of truth for the auth/onboarding/tabs routing decision.
    // Bail until auth/profile have resolved AND the root navigator is ready.
    if (loading || profileLoading) return;
    if (!navigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    const onboardingComplete = Boolean(profile?.onboarding_completed_at);

    if (!session && (inTabsGroup || inOnboarding || segments[0] === undefined)) {
      // Not logged in → start at the combined login/hero screen.
      router.replace('/(auth)/login');
    } else if (session && !onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (session && onboardingComplete && inOnboarding) {
      router.replace('/(tabs)/buscar');
    } else if (session && onboardingComplete && (inAuthGroup || segments[0] === undefined)) {
      // Logged in and in auth group or root → redirect to tabs
      router.replace('/(tabs)/buscar');
    }
  }, [session, profile, loading, profileLoading, navigationReady, segments, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="ride/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="profile/vehicle"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
      {/* Opaque, full-screen overlay layered ON TOP of the always-mounted
          <Stack> while auth/profile resolve. The navigator is never withheld,
          so a navigator is always present to handle router.replace. */}
      {showSplash && (
        <View style={StyleSheet.absoluteFill} pointerEvents="auto">
          <BrandSplash />
        </View>
      )}
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void hideSplashScreenOnce();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
