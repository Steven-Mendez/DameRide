import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import { getProfile } from '../lib/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = async () => {
    if (user) {
      setProfileLoading(true);
      const p = await getProfile(user.id);
      setProfile(p);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileLoading(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (cancelled) return;
      if (error) {
        console.error('Error loading auth session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Load profile when user changes
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    getProfile(user.id).then((nextProfile) => {
      if (!cancelled) {
        setProfile(nextProfile);
        setProfileLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, profileLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
