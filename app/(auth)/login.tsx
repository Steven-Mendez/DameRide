import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Lock, Mail, UserPlus } from 'lucide-react-native';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { GoogleSignInButton } from '@/src/features/auth/components/GoogleSignInButton';
import DameRideLogo from '@/src/components/DameRideLogo';
import { signIn } from '@/src/lib/auth';
import { Colors, Shadows } from '@/src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const nextEmail = email.trim();

    if (!nextEmail || !password) {
      Alert.alert('Campos incompletos', 'Ingresa tu correo y contraseña para continuar.');
      return;
    }

    if (!nextEmail.includes('@')) {
      Alert.alert('Correo invalido', 'Revisa que tu correo este escrito correctamente.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(nextEmail, password);
    setLoading(false);

    if (error) {
      Alert.alert('Error de inicio de sesión', error.message);
    } else {
      router.replace('/(tabs)/buscar');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 gap-3 pt-1">
            <View className="items-center gap-2">
              <View className="flex-row items-center justify-center py-4">
                <DameRideLogo size={140} accessibilityLabel="DameRide" />
              </View>

              <Text className="font-jakarta text-sm text-on-surface-variant text-center max-w-[290px] leading-5">
                Comparte tu ruta, ahorra dinero y viaja acompañado.
              </Text>
            </View>

            <View
              className="bg-white rounded-[26px] p-4 border border-outline-variant/20 gap-3"
              style={Shadows.surface}
            >
              <GoogleSignInButton disabled={loading} />

              <TouchableOpacity
                className="h-14 rounded-xl bg-primary flex-row items-center justify-center gap-2 px-6"
                activeOpacity={0.8}
                onPress={() => router.push('/(auth)/register')}
              >
                <UserPlus size={20} color={Colors.onPrimary} />
                <Text className="font-jakarta-bold text-base text-on-primary">
                  Crear cuenta
                </Text>
                <ArrowRight size={18} color={Colors.onPrimary} />
              </TouchableOpacity>

              <View className="flex-row items-center py-1 gap-3">
                <View className="flex-1 h-px bg-outline-variant/30" />
                <Text className="font-jakarta-semibold text-xs uppercase tracking-wider text-outline">
                  o inicia con correo
                </Text>
                <View className="flex-1 h-px bg-outline-variant/30" />
              </View>

              <View className="gap-4">
                <Input
                  label="Correo electrónico"
                  placeholder="tu@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon={<Mail size={20} color={Colors.primary} />}
                />
                <Input
                  label="Contraseña"
                  placeholder="Tu contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon={<Lock size={20} color={Colors.primary} />}
                />
              </View>

              <Button
                title="Iniciar sesion"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
