import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Save } from 'lucide-react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Colors, Shadows } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { createVehicle, getVehiclesByOwner, updateVehicle } from '@/src/lib/database';
import { uploadVehiclePhoto } from '@/src/lib/storage';

const isLocalImageUri = (uri: string | null) => {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
};

export default function EditVehicleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ mode?: string; id?: string }>();

  const mode = params.mode === 'edit' ? 'edit' : 'create';
  const vehicleId = typeof params.id === 'string' ? params.id : null;

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [seats, setSeats] = useState('4');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(mode === 'edit');
  const [savingVehicle, setSavingVehicle] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadingVehicle(false);
      return;
    }
    if (mode !== 'edit') {
      setLoadingVehicle(false);
      return;
    }
    if (!vehicleId) {
      Alert.alert('Error', 'No se encontro el vehiculo a editar.');
      router.back();
      return;
    }

    setLoadingVehicle(true);
    getVehiclesByOwner(user.id).then((vehicles) => {
      const vehicle = vehicles.find((item) => item.id === vehicleId);
      if (!vehicle) {
        Alert.alert('No encontrado', 'Este vehiculo ya no existe o no te pertenece.');
        router.back();
        return;
      }

      setMake(vehicle.make);
      setModel(vehicle.model);
      setColor(vehicle.color ?? '');
      setPlate(vehicle.plate ?? '');
      setSeats(String(vehicle.seats));
      setPhotoUri(vehicle.photo_url);
      setPhotoChanged(false);
      setLoadingVehicle(false);
    });
  }, [mode, router, user, vehicleId]);

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Activa el permiso de camara para tomar fotos del vehiculo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]?.uri) return;
    setPhotoUri(result.assets[0].uri);
    setPhotoChanged(true);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Activa el permiso de fotos para seleccionar imagenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]?.uri) return;
    setPhotoUri(result.assets[0].uri);
    setPhotoChanged(true);
  };

  const openPhotoSelector = () => {
    Alert.alert('Foto del vehiculo', 'Elige una opcion', [
      {
        text: 'Tomar foto',
        onPress: () => {
          void pickFromCamera();
        },
      },
      {
        text: 'Elegir de galeria',
        onPress: () => {
          void pickFromLibrary();
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const canSaveVehicle = useMemo(() => {
    const parsedSeats = Number.parseInt(seats, 10);
    return Boolean(make.trim() && model.trim() && Number.isFinite(parsedSeats) && parsedSeats >= 1 && parsedSeats <= 8);
  }, [make, model, seats]);

  const saveVehicle = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesion para gestionar vehiculos.');
      return;
    }

    if (mode === 'edit' && !vehicleId) {
      Alert.alert('Error', 'Falta el vehiculo a editar.');
      return;
    }

    const parsedSeats = Number.parseInt(seats, 10);
    if (!canSaveVehicle) {
      Alert.alert('Datos invalidos', 'Completa marca, modelo y asientos validos (1-8).');
      return;
    }

    setSavingVehicle(true);

    let nextPhotoUrl: string | null = photoUri;
    if (photoUri && isLocalImageUri(photoUri) && photoChanged) {
      const upload = await uploadVehiclePhoto({
        ownerId: user.id,
        localUri: photoUri,
        vehicleId: mode === 'edit' ? vehicleId ?? undefined : undefined,
      });

      if (upload.error || !upload.data) {
        setSavingVehicle(false);
        Alert.alert(
          'No se pudo subir la foto',
          upload.error?.message ?? 'Revisa el bucket vehicles y sus politicas en Supabase.'
        );
        return;
      }

      nextPhotoUrl = upload.data;
    }

    const payload = {
      make: make.trim(),
      model: model.trim(),
      color: color.trim() || null,
      plate: plate.trim().toUpperCase() || null,
      seats: parsedSeats,
      photo_url: nextPhotoUrl || null,
    };

    if (mode === 'edit' && vehicleId) {
      const { error } = await updateVehicle(vehicleId, user.id, payload);
      if (error) {
        setSavingVehicle(false);
        Alert.alert('Error', error.message);
        return;
      }
    } else {
      const { error } = await createVehicle({
        owner_id: user.id,
        ...payload,
      });
      if (error) {
        setSavingVehicle(false);
        Alert.alert('Error', error.message);
        return;
      }
    }

    setSavingVehicle(false);
    Alert.alert(
      mode === 'edit' ? 'Vehiculo actualizado' : 'Vehiculo agregado',
      'Los datos del vehiculo se guardaron correctamente.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }}>
        <AppHeader showBack showNotification={false} />

        <View className="px-5 py-6 gap-6">
          <View className="gap-1">
            <Text className="font-jakarta-bold text-[30px] text-on-surface tracking-tight">
              {mode === 'edit' ? 'Editar vehiculo' : 'Agregar vehiculo'}
            </Text>
            <Text className="font-jakarta text-sm text-on-surface-variant">
              Completa la informacion y agrega una foto para generar confianza.
            </Text>
          </View>

          {loadingVehicle ? (
            <View className="bg-white rounded-[20px] border border-outline-variant/20 p-6" style={Shadows.sm}>
              <Text className="font-jakarta text-sm text-outline">Cargando vehiculo...</Text>
            </View>
          ) : (
            <View className="bg-white rounded-[20px] border border-outline-variant/20 p-5 gap-3" style={Shadows.surface}>
              <TouchableOpacity
                className="h-44 rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low overflow-hidden items-center justify-center"
                activeOpacity={0.85}
                onPress={openPhotoSelector}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View className="items-center gap-2">
                    <ImagePlus size={26} color={Colors.outline} />
                    <Text className="font-jakarta-semibold text-xs text-on-surface-variant">
                      Agregar foto del vehiculo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input label="Marca" placeholder="Toyota" value={make} onChangeText={setMake} />
                </View>
                <View className="flex-1">
                  <Input label="Modelo" placeholder="Corolla" value={model} onChangeText={setModel} />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input label="Color" placeholder="Gris" value={color} onChangeText={setColor} />
                </View>
                <View className="flex-1">
                  <Input
                    label="Asientos"
                    placeholder="4"
                    value={seats}
                    onChangeText={setSeats}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Input
                label="Placa"
                placeholder="M 12345"
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
              />

              <View className="flex-row gap-3 pt-1">
                <View className="flex-1">
                  <Button title="Cancelar" variant="ghost" onPress={() => router.back()} disabled={savingVehicle} />
                </View>
                <View className="flex-1">
                  <Button
                    title={mode === 'edit' ? 'Actualizar' : 'Guardar'}
                    variant="primary-container"
                    icon={<Save size={18} color={Colors.onPrimaryContainer} />}
                    onPress={() => {
                      void saveVehicle();
                    }}
                    loading={savingVehicle}
                    disabled={!canSaveVehicle}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
