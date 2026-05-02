import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, Phone, MapPin, ArrowLeft } from 'lucide-react-native';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { signUp } from '@/src/lib/auth';
import { Colors } from '@/src/constants/theme';
import { formatNicaraguaPhoneInput, toNicaraguaPhoneStorage } from '@/src/utils/format';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Nombre, correo y contraseña son obligatorios.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const phoneForStorage = phone ? toNicaraguaPhoneStorage(phone) : null;
    if (phone && !phoneForStorage) {
      Alert.alert('Teléfono inválido', 'Ingresa un número nicaragüense de 8 dígitos.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, {
      full_name: fullName.trim(),
      phone: phoneForStorage ?? '',
      city: city.trim(),
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error de registro', error.message);
    } else {
      Alert.alert(
        '¡Cuenta creada!',
        'Tu cuenta fue creada exitosamente. Ya puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => router.replace('/onboarding') }]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center gap-3 mt-4 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -ml-2"
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text className="font-jakarta-extrabold text-xl text-primary tracking-tight">
              DameRide
            </Text>
          </View>

          {/* Title */}
          <View className="mb-8">
            <Text className="font-jakarta-bold text-3xl text-on-surface tracking-tight">
              Crear cuenta
            </Text>
            <Text className="font-jakarta text-base text-on-surface-variant mt-2">
              Únete a la comunidad de viajes compartidos en Nicaragua.
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-8">
            <Input
              label="Nombre completo *"
              placeholder="Ej. María López"
              value={fullName}
              onChangeText={setFullName}
              icon={<User size={20} color={Colors.primary} />}
            />
            <Input
              label="Correo electrónico *"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Mail size={20} color={Colors.primary} />}
            />
            <Input
              label="Teléfono (+505)"
              placeholder="8888 0000"
              value={phone}
              onChangeText={(value) => setPhone(formatNicaraguaPhoneInput(value))}
              keyboardType="number-pad"
              maxLength={9}
              icon={<Phone size={20} color={Colors.primary} />}
            />
            <Input
              label="Ciudad"
              placeholder="Ej. Managua"
              value={city}
              onChangeText={setCity}
              icon={<MapPin size={20} color={Colors.primary} />}
            />
            <Input
              label="Contraseña *"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color={Colors.primary} />}
            />
          </View>

          {/* Register Button */}
          <Button
            title="Crear cuenta"
            onPress={handleRegister}
            loading={loading}
            variant="primary"
          />

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="font-jakarta text-sm text-on-surface-variant">
              ¿Ya tienes cuenta?
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="font-jakarta-bold text-sm text-primary">
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
