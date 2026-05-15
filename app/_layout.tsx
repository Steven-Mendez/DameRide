import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
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

  useEffect(() => {
    if (loading || profileLoading) return;

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
  }, [session, profile, loading, profileLoading, segments, router]);

  if (loading || profileLoading) {
    return <BrandSplash />;
  }

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
