import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Star, Edit, LogOut, Phone, MessageSquare, Car, ChevronRight } from 'lucide-react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { DriverBadge } from '@/src/components/DriverBadge';
import { Button } from '@/src/components/Button';
import { useAuth } from '@/src/hooks/useAuth';
import { signOut } from '@/src/lib/auth';
import { getVehiclesByOwner } from '@/src/lib/database';
import { getDisplayAvatarUrl } from '@/src/utils/avatar';
import { formatNicaraguaPhoneDisplay, getWhatsAppUrl } from '@/src/utils/format';
import { Colors, Shadows } from '@/src/constants/theme';

export default function PerfilScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const avatarUrl = getDisplayAvatarUrl(profile, user);
  const [loggingOut, setLoggingOut] = useState(false);
  const [vehiclesCount, setVehiclesCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setVehiclesCount(0);
      return;
    }

    getVehiclesByOwner(user.id).then((vehicles) => {
      setVehiclesCount(vehicles.length);
    });
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await signOut();
            setLoggingOut(false);
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleWhatsApp = () => {
    if (profile?.phone) {
      Linking.openURL(getWhatsAppUrl(profile.phone)).catch(() => {
        Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <AppHeader />

        <View className="px-5 pt-6 gap-6">
          {/* Profile Hero Card */}
          <View
            className="bg-white rounded-[24px] p-6 border border-outline-variant/20 overflow-hidden"
            style={Shadows.surface}
          >
            <View className="items-center gap-4">
              <DriverBadge name={profile?.full_name ?? null} avatarUrl={avatarUrl} size="lg" />

              <View className="items-center gap-1">
                <Text className="font-jakarta-bold text-3xl text-on-surface tracking-tight">
                  {profile?.full_name ?? 'Usuario'}
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="flex-row items-center gap-1">
                    <Star size={18} fill={Colors.amber400} color={Colors.amber400} />
                    <Text className="font-jakarta-semibold text-sm text-primary">
                      {profile?.rating ?? '5.0'} estrellas
                    </Text>
                  </View>
                  <Text className="text-outline-variant text-xs">•</Text>
                  <Text className="font-jakarta-semibold text-sm text-on-surface-variant">
                    {profile?.city ?? 'Nicaragua'}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View className="flex-row gap-4 w-full pt-4">
                <View className="flex-1 bg-surface-container-low rounded-xl p-4 items-center">
                  <Text className="font-jakarta-bold text-2xl text-primary">
                    {profile?.completed_rides ?? 0}
                  </Text>
                  <Text className="font-jakarta-medium text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">
                    Viajes
                  </Text>
                </View>
                <View className="flex-1 bg-surface-container-low rounded-xl p-4 items-center">
                  <Car size={24} color={Colors.secondary} />
                  <Text className="font-jakarta-semibold text-sm text-on-surface mt-1">
                    {vehiclesCount} vehículo{vehiclesCount === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Card */}
          <View
            className="bg-white rounded-[20px] p-6 border border-outline-variant/20 gap-4"
            style={Shadows.sm}
          >
            <View className="flex-row items-center gap-2">
              <Phone size={20} color={Colors.primary} />
              <Text className="font-jakarta-bold text-lg">Contacto Directo</Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 bg-primary-container/10 rounded-xl"
              onPress={handleWhatsApp}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-[#25D366] rounded-full items-center justify-center">
                  <MessageSquare size={20} color="#ffffff" />
                </View>
                <View>
                  <Text className="font-jakarta-semibold text-sm text-on-primary-container">
                    WhatsApp
                  </Text>
                  <Text className="font-jakarta text-base text-on-surface">
                    {profile?.phone ? formatNicaraguaPhoneDisplay(profile.phone) : '+505 XXXX XXXX'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.outline} />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="gap-3">
            <Button
              title={`Editar perfil y vehículos (${vehiclesCount})`}
              variant="primary"
              icon={<Edit size={20} color={Colors.onPrimary} />}
              onPress={() => router.push('/profile/edit')}
            />
            <Button
              title="Cerrar sesión"
              variant="danger"
              icon={<LogOut size={20} color={Colors.onErrorContainer} />}
              onPress={handleLogout}
              loading={loggingOut}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
