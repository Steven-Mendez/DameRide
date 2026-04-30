import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const DEFAULT_AUTH_CALLBACK_PATH = 'auth/callback';

export function getAuthRedirectUrl() {
  if (Constants.appOwnership === 'expo') {
    return AuthSession.makeRedirectUri({
      path: DEFAULT_AUTH_CALLBACK_PATH,
    });
  }

  if (process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL) {
    return process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL;
  }

  return Linking.createURL(DEFAULT_AUTH_CALLBACK_PATH);
}

function getAuthParams(url: string) {
  const parsedUrl = new URL(url);
  const queryParams = parsedUrl.searchParams;
  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));

  return {
    code: queryParams.get('code') ?? hashParams.get('code'),
    accessToken: queryParams.get('access_token') ?? hashParams.get('access_token'),
    refreshToken: queryParams.get('refresh_token') ?? hashParams.get('refresh_token'),
    error: queryParams.get('error_description') ?? hashParams.get('error_description') ?? queryParams.get('error') ?? hashParams.get('error'),
  };
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase no esta configurado.') };
  }

  const redirectTo = getAuthRedirectUrl();

  if (__DEV__) {
    console.info('Google auth redirect URL:', redirectTo);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) return { error };
  if (!data.url) return { error: new Error('Google no devolvio una URL de autenticacion.') };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { error: null, cancelled: true };
  }

  if (result.type !== 'success') {
    return { error: new Error('No se pudo completar el inicio de sesion con Google.') };
  }

  const params = getAuthParams(result.url);
  if (params.error) return { error: new Error(params.error) };

  if (params.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
    return { error: exchangeError };
  }

  if (params.accessToken && params.refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });
    return { error: sessionError };
  }

  return { error: new Error('La respuesta de Google no incluyo una sesion valida.') };
}
