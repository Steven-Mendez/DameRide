import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="items-center gap-4 px-8">
        <Text className="font-jakarta-bold text-3xl text-on-surface">🚗</Text>
        <Text className="font-jakarta-bold text-xl text-on-surface text-center">
          Página no encontrada
        </Text>
        <Link href="/" className="mt-4">
          <Text className="font-jakarta-semibold text-base text-primary">
            Volver al inicio
          </Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
