import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, PlusCircle, MapPin, Calendar, User, Bell } from 'lucide-react-native';
import { Colors, Shadows } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, profile, profileLoading } = useAuth();

  // If already logged in, go to tabs
  React.useEffect(() => {
    if (!session) {
      router.replace('/(auth)/login');
      return;
    }

    if (profileLoading) return;

    if (profile?.onboarding_completed_at) {
      router.replace('/(tabs)/buscar');
    } else {
      router.replace('/onboarding');
    }
  }, [profile?.onboarding_completed_at, profileLoading, router, session]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 h-16 border-b border-gray-100">
          <Text className="font-jakarta-extrabold text-xl text-primary tracking-tight">
            RideTogether
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity className="p-2 rounded-full" activeOpacity={0.7}>
              <Bell size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View className="items-center mt-4 mb-6 px-5">
          <View
            className="w-full aspect-[4/3] rounded-[24px] overflow-hidden mb-6 bg-surface-container"
            style={Shadows.sm}
          >
            <Image
              source={require('@/assets/images/hero_illustration.png')}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          </View>

          <Text className="font-jakarta-bold text-[30px] text-on-surface text-center tracking-tight">
            RideTogether
          </Text>
          <Text className="font-jakarta text-base text-on-surface-variant text-center mt-2 max-w-[280px]">
            Comparte tu ruta, ahorra dinero y viaja acompañado
          </Text>
        </View>

        {/* Search Card (Glassmorphism) */}
        <View
          className="mx-5 bg-white rounded-[24px] p-6 mb-6 border border-outline-variant/20"
          style={Shadows.surface}
        >
          <View className="gap-3">
            <View className="flex-row items-center gap-3 h-14 px-4 bg-surface-container-low rounded-xl">
              <MapPin size={20} color={Colors.primary} />
              <Text className="font-jakarta text-sm text-outline">
                ¿A dónde vas hoy?
              </Text>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1 flex-row items-center gap-2 h-14 px-4 bg-surface-container-low rounded-xl">
                <Calendar size={18} color={Colors.outline} />
                <Text className="font-jakarta-medium text-sm text-on-surface">Hoy</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2 h-14 px-4 bg-surface-container-low rounded-xl">
                <User size={18} color={Colors.outline} />
                <Text className="font-jakarta-medium text-sm text-on-surface">1 pers.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Primary Actions */}
        <View className="px-5 gap-3 mb-6">
          <TouchableOpacity
            className="h-14 bg-primary-container rounded-xl flex-row items-center justify-center gap-2"
            style={Shadows.action}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/login')}
          >
            <Search size={20} color={Colors.onPrimaryContainer} />
            <Text className="font-jakarta-bold text-lg text-on-primary-container">
              Buscar viaje
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-14 bg-secondary-container rounded-xl flex-row items-center justify-center gap-2"
            style={Shadows.action}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/login')}
          >
            <PlusCircle size={20} color={Colors.onSecondaryContainer} />
            <Text className="font-jakarta-bold text-lg text-on-secondary-container">
              Publicar viaje
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="font-jakarta-semibold text-sm text-on-secondary-fixed-variant">
              Iniciar sesión
            </Text>
          </TouchableOpacity>
        </View>

        {/* Community Stats */}
        <View className="flex-row gap-3 px-5">
          <View className="flex-1 bg-primary-container/10 p-4 rounded-xl">
            <Text className="font-jakarta-bold text-xl text-primary">50k+</Text>
            <Text className="font-jakarta-semibold text-[10px] uppercase tracking-wider text-on-primary-container">
              Usuarios
            </Text>
          </View>
          <View className="flex-1 bg-secondary-container/10 p-4 rounded-xl">
            <Text className="font-jakarta-bold text-xl text-secondary">120k</Text>
            <Text className="font-jakarta-semibold text-[10px] uppercase tracking-wider text-on-secondary-fixed-variant">
              Viajes hoy
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
