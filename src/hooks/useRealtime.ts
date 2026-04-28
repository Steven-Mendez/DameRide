import { useEffect } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Reservation, Ride } from '../types/database';

type RealtimeRow<T> = T & { [key: string]: unknown };
type RealtimeCallback<T> = (payload: RealtimePostgresChangesPayload<RealtimeRow<T>>) => void;

export function useRealtimeRides(callback: RealtimeCallback<Ride>) {
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel(`rides-changes-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides',
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callback]);
}

export function useRealtimeReservations(
  userId: string | undefined,
  callback: RealtimeCallback<Reservation>
) {
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;

    const channel = supabase
      .channel(`reservations-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `passenger_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, callback]);
}
