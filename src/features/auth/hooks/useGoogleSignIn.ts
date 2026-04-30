import { useState } from 'react';
import { useRouter } from 'expo-router';
import { signInWithGoogle } from '../services/googleAuth';

export function useGoogleSignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (loading) return { error: null, cancelled: true };

    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.error && !result.cancelled) {
        router.replace('/(tabs)/buscar');
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading };
}
