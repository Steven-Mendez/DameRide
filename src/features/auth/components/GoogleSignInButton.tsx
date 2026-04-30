import React from 'react';
import { Alert, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

interface GoogleSignInButtonProps {
  disabled?: boolean;
}

export function GoogleSignInButton({ disabled }: GoogleSignInButtonProps) {
  const { signIn, loading } = useGoogleSignIn();

  const handlePress = async () => {
    const { error, cancelled } = await signIn();
    if (error && !cancelled) {
      Alert.alert('Error con Google', error.message);
    }
  };

  return (
    <Button
      title="Continuar con Google"
      variant="ghost"
      loading={loading}
      disabled={disabled || loading}
      icon={(
        <View className="h-6 w-6 items-center justify-center rounded-full bg-white border border-outline-variant/40">
          <Text className="font-jakarta-bold text-sm text-on-surface">G</Text>
        </View>
      )}
      onPress={handlePress}
    />
  );
}
