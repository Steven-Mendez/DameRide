import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Car, PencilLine, Plus, Save, Trash2, UserRound } from 'lucide-react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Colors, Shadows } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { getVehiclesByOwner, updateProfile } from '@/src/lib/database';
import { deleteAvatar, uploadAvatar } from '@/src/lib/storage';
import type { Vehicle } from '@/src/types/database';
import { getProviderAvatarUrl } from '@/src/utils/avatar';
import { formatNicaraguaPhoneInput, toNicaraguaPhoneStorage } from '@/src/utils/format';

const isLocalImageUri = (uri: string | null) => {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const providerAvatarUrl = getProviderAvatarUrl(user);
  const displayAvatarUri = avatarUri ?? providerAvatarUrl;

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(formatNicaraguaPhoneInput(profile?.phone ?? ''));
    setCity(profile?.city ?? '');
    setAvatarUri(profile?.avatar_url ?? null);
    setAvatarChanged(false);
  }, [profile?.full_name, profile?.phone, profile?.city, profile?.avatar_url]);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Activa el permiso de fotos para seleccionar tu avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets[0]?.uri) return;
    setAvatarUri(result.assets[0].uri);
    setAvatarChanged(true);
  };

  const removeAvatar = () => {
    setAvatarUri(null);
    setAvatarChanged(true);
  };

  const loadVehicles = useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setLoadingVehicles(false);
      return;
    }

    setLoadingVehicles(true);
    const data = await getVehiclesByOwner(user.id);
    setVehicles(data);
    setLoadingVehicles(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadVehicles();
    }, [loadVehicles])
  );

  const saveProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesion para editar tu perfil.');
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Campo requerido', 'El nombre completo es obligatorio.');
      return;
    }

    const phoneForStorage = phone ? toNicaraguaPhoneStorage(phone) : null;
    if (phone && !phoneForStorage) {
      Alert.alert('Telefono invalido', 'Ingresa un numero nicaraguense de 8 digitos.');
      return;
    }

    setSavingProfile(true);

    let nextAvatarUrl: string | null = avatarUri;
    if (avatarUri && avatarChanged && isLocalImageUri(avatarUri)) {
      const upload = await uploadAvatar({
        userId: user.id,
        localUri: avatarUri,
      });

      if (upload.error || !upload.data) {
        setSavingProfile(false);
        Alert.alert(
          'No se pudo subir el avatar',
          upload.error?.message ?? 'Revisa el bucket avatars y sus politicas en Supabase.'
        );
        return;
      }

      nextAvatarUrl = upload.data;
    }

    const { error } = await updateProfile(user.id, {
      full_name: fullName.trim(),
      phone: phoneForStorage,
      city: city.trim() || null,
      avatar_url: nextAvatarUrl,
    });

    if (error) {
      setSavingProfile(false);
      Alert.alert('Error', error.message);
      return;
    }

    const previousAvatarUrl = profile?.avatar_url ?? null;
    const shouldDeleteAvatar = avatarChanged && !nextAvatarUrl && previousAvatarUrl;
    const deleteResult = shouldDeleteAvatar ? await deleteAvatar(previousAvatarUrl) : null;

    setSavingProfile(false);

    await refreshProfile();
    if (deleteResult?.error) {
      Alert.alert(
        'Perfil actualizado',
        'Tu foto fue removida del perfil, pero no se pudo eliminar el archivo anterior del almacenamiento.'
      );
      return;
    }

    Alert.alert('Perfil actualizado', 'Tus datos fueron guardados correctamente.');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }}>
        <AppHeader showBack showNotification={false} />

        <View className="px-5 py-6 gap-6">
          <View className="gap-1">
            <Text className="font-jakarta-bold text-[30px] text-on-surface tracking-tight">
              Editar perfil
            </Text>
            <Text className="font-jakarta text-sm text-on-surface-variant">
              Actualiza tus datos y administra tus vehiculos.
            </Text>
          </View>

          <View
            className="bg-white rounded-[20px] border border-outline-variant/20 p-5 gap-3"
            style={Shadows.sm}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <UserRound size={18} color={Colors.primary} />
              <Text className="font-jakarta-bold text-lg text-on-surface">Datos personales</Text>
            </View>
            <TouchableOpacity
              className="self-center w-28 h-28 rounded-full bg-surface-container-low border-4 border-primary-fixed overflow-hidden items-center justify-center"
              activeOpacity={0.85}
              onPress={() => {
                void pickAvatar();
              }}
            >
              {displayAvatarUri ? (
                <Image source={{ uri: displayAvatarUri }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <View className="items-center gap-1">
                  <Camera size={24} color={Colors.outline} />
                  <Text className="font-jakarta-semibold text-[10px] text-outline text-center px-2">
                    Agregar avatar
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text className="font-jakarta-medium text-xs text-primary text-center">
              Cambiar foto de perfil
            </Text>
            {avatarUri ? (
              <TouchableOpacity
                className="self-center h-10 px-4 rounded-full bg-error-container border border-error/20 flex-row items-center gap-2"
                activeOpacity={0.8}
                disabled={savingProfile}
                onPress={removeAvatar}
              >
                <Trash2 size={16} color={Colors.onErrorContainer} />
                <Text className="font-jakarta-semibold text-xs text-on-error-container">
                  Eliminar foto
                </Text>
              </TouchableOpacity>
            ) : null}
            <Input
              label="Nombre completo"
              placeholder="Ej. Maria Lopez"
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              label="Telefono (+505)"
              placeholder="8888 0000"
              value={phone}
              onChangeText={(value) => setPhone(formatNicaraguaPhoneInput(value))}
              keyboardType="number-pad"
              maxLength={9}
            />
            <Input
              label="Ciudad"
              placeholder="Ej. Managua"
              value={city}
              onChangeText={setCity}
            />
            <Button
              title="Guardar perfil"
              variant="primary"
              icon={<Save size={18} color={Colors.onPrimary} />}
              onPress={() => {
                void saveProfile();
              }}
              loading={savingProfile}
            />
          </View>

          <View
            className="bg-white rounded-[20px] border border-outline-variant/20 p-5 gap-4"
            style={Shadows.sm}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Car size={18} color={Colors.secondary} />
                <Text className="font-jakarta-bold text-lg text-on-surface">Mis vehiculos</Text>
              </View>
              <TouchableOpacity
                className="h-10 px-3 rounded-full bg-primary/10 flex-row items-center gap-1.5"
                activeOpacity={0.8}
                onPress={() => router.push('/profile/vehicle?mode=create')}
              >
                <Plus size={16} color={Colors.primary} />
                <Text className="font-jakarta-semibold text-xs text-primary">Agregar</Text>
              </TouchableOpacity>
            </View>

            {loadingVehicles ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={Colors.primary} />
                <Text className="font-jakarta text-xs text-outline mt-2">Cargando vehiculos...</Text>
              </View>
            ) : vehicles.length === 0 ? (
              <View className="py-8 px-4 rounded-xl bg-surface-container-low items-center gap-2">
                <Car size={20} color={Colors.outline} />
                <Text className="font-jakarta-semibold text-sm text-on-surface-variant text-center">
                  Aun no has agregado vehiculos.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {vehicles.map((vehicle) => (
                  <View
                    key={vehicle.id}
                    className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-3"
                  >
                    <View className="flex-row gap-3 items-center">
                      <View className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high items-center justify-center">
                        {vehicle.photo_url ? (
                          <Image source={{ uri: vehicle.photo_url }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                          <Car size={24} color={Colors.outline} />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="font-jakarta-bold text-sm text-on-surface">
                          {vehicle.make} {vehicle.model}
                        </Text>
                        <Text className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                          {vehicle.color ?? 'Color no definido'} · {vehicle.seats} asientos
                        </Text>
                        <Text className="font-jakarta text-xs text-outline mt-0.5">
                          {vehicle.plate ?? 'Sin placa'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className="h-10 px-3 rounded-full border border-outline-variant/40 bg-white flex-row items-center gap-1.5"
                        activeOpacity={0.8}
                        onPress={() => router.push(`/profile/vehicle?mode=edit&id=${vehicle.id}`)}
                      >
                        <PencilLine size={14} color={Colors.outline} />
                        <Text className="font-jakarta-semibold text-xs text-on-surface-variant">Editar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="h-12 rounded-xl items-center justify-center bg-surface-container-low"
            activeOpacity={0.8}
          >
            <Text className="font-jakarta-semibold text-sm text-on-surface-variant">Volver al perfil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
