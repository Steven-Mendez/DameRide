import { isSupabaseConfigured, supabase } from './supabase';

export async function signUp(
  email: string,
  password: string,
  metadata: { full_name: string; phone: string; city: string }
) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    return { session: null, error: null };
  }

  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getUser() {
  if (!isSupabaseConfigured) {
    return { user: null, error: null };
  }

  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}
