import { isSupabaseConfigured, supabase } from './supabase';
import type {
  Profile,
  RideWithDriver,
  ReservationWithDetails,
  Vehicle,
} from '../types/database';
import type { TablesInsert, TablesUpdate } from '../types/supabase';

const PROFILE_SELECT = 'id, full_name, phone, city, avatar_url, rating, completed_rides, onboarding_completed_at, university, student_id, created_at';
const VEHICLE_SELECT = 'id, owner_id, make, model, color, plate, seats, photo_url, created_at';
const RIDE_SELECT = 'id, driver_id, vehicle_id, origin, origin_place_name, origin_address, origin_lat, origin_lng, destination, destination_place_name, destination_address, destination_lat, destination_lng, route_polyline, route_distance_meters, route_duration_seconds, meeting_point, meeting_point_lat, meeting_point_lng, departure_time, estimated_arrival_time, available_seats, price_cordobas, notes, status, created_at';
const RESERVATION_SELECT = 'id, ride_id, passenger_id, seats_reserved, status, created_at';
const RIDE_WITH_DRIVER_SELECT = `${RIDE_SELECT}, driver:profiles!rides_driver_id_fkey(${PROFILE_SELECT}), vehicle:vehicles!rides_vehicle_id_fkey(${VEHICLE_SELECT})`;

// ============================================
// PROFILES
// ============================================

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: TablesUpdate<'profiles'>) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(PROFILE_SELECT)
    .single();

  return { data, error };
}

// ============================================
// VEHICLES
// ============================================

export async function getVehiclesByOwner(ownerId: string): Promise<Vehicle[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select(VEHICLE_SELECT)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
  return data ?? [];
}

export async function createVehicle(vehicle: TablesInsert<'vehicles'>) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle)
    .select(VEHICLE_SELECT)
    .single();

  return { data, error };
}

export async function updateVehicle(
  vehicleId: string,
  ownerId: string,
  updates: TablesUpdate<'vehicles'>,
) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase no esta configurado.') };
  }

  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', vehicleId)
    .eq('owner_id', ownerId)
    .select(VEHICLE_SELECT)
    .single();

  return { data, error };
}

// ============================================
// RIDES
// ============================================

type RideSortBy = 'nearest_pickup' | 'soonest' | 'lowest_price' | 'most_seats';

type GetRidesFilters = {
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  radiusMeters?: number;
  sortBy?: RideSortBy;
  excludeDriverId?: string;
  page?: number;
  limit?: number;
};

export async function getRides(filters?: GetRidesFilters): Promise<{ data: RideWithDriver[]; hasMore: boolean }> {
  const requestedSort = filters?.sortBy ?? 'soonest';
  const limit = Math.max(filters?.limit ?? 20, 1);
  const page = Math.max(filters?.page ?? 0, 0);
  const from = page * limit;
  const to = from + limit;

  if (!isSupabaseConfigured) {
    return filterMockRides(filters, requestedSort, from, limit);
  }

  if (
    filters?.pickupLat !== undefined &&
    filters?.pickupLng !== undefined &&
    filters?.destinationLat !== undefined &&
    filters?.destinationLng !== undefined
  ) {
    const nearbyPayload = {
      search_origin_lat: filters.pickupLat,
      search_origin_lng: filters.pickupLng,
      search_dest_lat: filters.destinationLat,
      search_dest_lng: filters.destinationLng,
      radius_meters: filters.radiusMeters ?? 5000,
    };

    const { data: nearbyIds, error: nearbyError } = await supabase.rpc('search_rides_nearby', nearbyPayload);

    if (nearbyError) {
      console.error('Error searching rides nearby:', nearbyError);
      return { data: [], hasMore: false };
    }

    const ids = (nearbyIds ?? []).map((ride) => ride.id);
    if (!ids.length) return { data: [], hasMore: false };

    let nearbyQuery = supabase
      .from('rides')
      .select(RIDE_WITH_DRIVER_SELECT)
      .in('id', ids)
      .eq('status', 'active')
      .gt('available_seats', 0)
      .gte('departure_time', new Date().toISOString());

    if (filters.origin) {
      nearbyQuery = nearbyQuery.ilike('origin', `%${filters.origin}%`);
    }
    if (filters.destination) {
      nearbyQuery = nearbyQuery.ilike('destination', `%${filters.destination}%`);
    }
    if (filters.excludeDriverId) {
      nearbyQuery = nearbyQuery.neq('driver_id', filters.excludeDriverId);
    }
    if (filters.date) {
      const start = new Date(`${filters.date}T${filters.time || '00:00'}:00`);
      const end = new Date(`${filters.date}T00:00:00`);
      end.setDate(end.getDate() + 1);
      nearbyQuery = nearbyQuery
        .gte('departure_time', start.toISOString())
        .lt('departure_time', end.toISOString());
    }
    if (requestedSort !== 'nearest_pickup') {
      nearbyQuery = nearbyQuery
        .order(
          requestedSort === 'lowest_price'
            ? 'price_cordobas'
            : requestedSort === 'most_seats'
              ? 'available_seats'
              : 'departure_time',
          { ascending: requestedSort !== 'most_seats' }
        )
        .range(from, to);
    }

    const { data: nearbyRides, error: nearbyRidesError } = await nearbyQuery;
    if (nearbyRidesError) {
      console.error('Error fetching nearby ride details:', nearbyRidesError);
      return { data: [], hasMore: false };
    }

    const orderedByDistance = ids.reduce((acc: Record<string, number>, id: string, index: number) => {
      acc[id] = index;
      return acc;
    }, {});

    let hydrated = (nearbyRides ?? []) as unknown as RideWithDriver[];
    hydrated = hydrated.filter((ride) => passesDateTimeFilter(ride.departure_time, filters?.date, filters?.time));

    if (requestedSort === 'nearest_pickup') {
      hydrated = hydrated.sort((a, b) => (orderedByDistance[a.id] ?? 0) - (orderedByDistance[b.id] ?? 0));
      const pageData = hydrated.slice(from, from + limit);
      return { data: pageData, hasMore: hydrated.length > from + limit };
    } else {
      hydrated = sortRides(hydrated, requestedSort);
    }

    return { data: hydrated.slice(0, limit), hasMore: (nearbyRides ?? []).length > limit };
  }

  let query = supabase
    .from('rides')
    .select(RIDE_WITH_DRIVER_SELECT)
    .eq('status', 'active')
    .gt('available_seats', 0)
    .gte('departure_time', new Date().toISOString())
    .order(
      requestedSort === 'lowest_price'
        ? 'price_cordobas'
        : requestedSort === 'most_seats'
          ? 'available_seats'
          : 'departure_time',
      { ascending: requestedSort !== 'most_seats' }
    );

  if (filters?.origin) {
    query = query.ilike('origin', `%${filters.origin}%`);
  }
  if (filters?.destination) {
    query = query.ilike('destination', `%${filters.destination}%`);
  }
  if (filters?.excludeDriverId) {
    query = query.neq('driver_id', filters.excludeDriverId);
  }
  if (filters?.date) {
    const start = new Date(`${filters.date}T${filters.time || '00:00'}:00`);
    const end = new Date(`${filters.date}T00:00:00`);
    end.setDate(end.getDate() + 1);
    query = query
      .gte('departure_time', start.toISOString())
      .lt('departure_time', end.toISOString());
  }
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching rides:', error);
    return { data: [], hasMore: false };
  }

  const rides = (data ?? []) as unknown as RideWithDriver[];
  const filtered = rides.filter((ride) => passesDateTimeFilter(ride.departure_time, filters?.date, filters?.time));
  const sorted = sortRides(filtered, requestedSort);
  return { data: sorted.slice(0, limit), hasMore: rides.length > limit };
}

export async function getRideById(rideId: string): Promise<RideWithDriver | null> {
  if (!isSupabaseConfigured) {
    const mock = MOCK_RIDES.find((ride) => ride.id === rideId);
    return mock ?? null;
  }

  const { data, error } = await supabase
    .from('rides')
    .select(RIDE_WITH_DRIVER_SELECT)
    .eq('id', rideId)
    .single();

  if (error) {
    console.error('Error fetching ride:', error);
    return null;
  }
  return data as unknown as RideWithDriver;
}

export async function getMyRides(driverId: string): Promise<RideWithDriver[]> {
  if (!isSupabaseConfigured) {
    return MOCK_RIDES.filter((ride) => ride.driver_id === driverId);
  }

  const { data, error } = await supabase
    .from('rides')
    .select(RIDE_WITH_DRIVER_SELECT)
    .eq('driver_id', driverId)
    .order('departure_time', { ascending: true });

  if (error) {
    console.error('Error fetching my rides:', error);
    return [];
  }

  return (data ?? []) as unknown as RideWithDriver[];
}

export async function createRide(ride: {
  driver_id: string;
  vehicle_id?: string;
  origin: string;
  origin_place_name?: string;
  origin_address?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination: string;
  destination_place_name?: string;
  destination_address?: string;
  destination_lat?: number;
  destination_lng?: number;
  route_polyline?: string;
  route_distance_meters?: number;
  route_duration_seconds?: number;
  meeting_point?: string;
  departure_time: string;
  estimated_arrival_time?: string;
  available_seats: number;
  price_cordobas: number;
  notes?: string;
}) {
  if (!isSupabaseConfigured) {
    const mockRide: RideWithDriver = {
      id: `mock-${Date.now()}`,
      driver_id: ride.driver_id,
      vehicle_id: ride.vehicle_id ?? null,
      origin: ride.origin,
      origin_place_name: ride.origin_place_name ?? null,
      origin_address: ride.origin_address ?? null,
      origin_lat: ride.origin_lat ?? null,
      origin_lng: ride.origin_lng ?? null,
      destination: ride.destination,
      destination_place_name: ride.destination_place_name ?? null,
      destination_address: ride.destination_address ?? null,
      destination_lat: ride.destination_lat ?? null,
      destination_lng: ride.destination_lng ?? null,
      route_polyline: ride.route_polyline ?? null,
      route_distance_meters: ride.route_distance_meters ?? null,
      route_duration_seconds: ride.route_duration_seconds ?? null,
      meeting_point: ride.meeting_point ?? null,
      meeting_point_lat: null,
      meeting_point_lng: null,
      departure_time: ride.departure_time,
      estimated_arrival_time: ride.estimated_arrival_time ?? null,
      available_seats: ride.available_seats,
      price_cordobas: ride.price_cordobas,
      notes: ride.notes ?? null,
      status: 'active',
      created_at: new Date().toISOString(),
      driver: {
        id: ride.driver_id,
        full_name: 'Conductor de prueba',
        phone: null,
        city: ride.origin,
        avatar_url: null,
        rating: 5,
        completed_rides: 0,
        onboarding_completed_at: new Date().toISOString(),
        university: null,
        student_id: null,
        created_at: new Date().toISOString(),
      },
      vehicle: null,
    };
    MOCK_RIDES.unshift(mockRide);
    return { data: mockRide, error: null };
  }

  const { data, error } = await supabase
    .from('rides')
    .insert(ride)
    .select(RIDE_WITH_DRIVER_SELECT)
    .single();

  return { data, error };
}

// ============================================
// RESERVATIONS
// ============================================

export async function getMyReservations(userId: string): Promise<ReservationWithDetails[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      ${RESERVATION_SELECT},
      ride:rides!reservations_ride_id_fkey(
        ${RIDE_SELECT},
        driver:profiles!rides_driver_id_fkey(${PROFILE_SELECT}),
        vehicle:vehicles!rides_vehicle_id_fkey(${VEHICLE_SELECT})
      )
    `)
    .eq('passenger_id', userId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }

  // Flatten the nested structure
  return (data ?? []).map((r: any) => ({
    ...r,
    ride: r.ride,
    driver: r.ride?.driver,
    vehicle: r.ride?.vehicle,
  })) as ReservationWithDetails[];
}

export async function reserveSeat(rideId: string, seats: number = 1) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  const { data, error } = await supabase.rpc('reserve_seat', {
    p_ride_id: rideId,
    p_seats: seats,
  });

  return { data, error };
}

export async function cancelReservation(reservationId: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  const { data, error } = await supabase.rpc('cancel_reservation', {
    p_reservation_id: reservationId,
  });

  return { data, error };
}

function passesDateTimeFilter(departureTimeIso: string, date?: string, time?: string): boolean {
  const departure = new Date(departureTimeIso);
  if (Number.isNaN(departure.getTime())) return false;

  if (date) {
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) return true;
    const sameDate = departure.getFullYear() === year
      && departure.getMonth() + 1 === month
      && departure.getDate() === day;
    if (!sameDate) return false;
  }

  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      const departureMinutes = departure.getHours() * 60 + departure.getMinutes();
      const filterMinutes = hours * 60 + minutes;
      if (departureMinutes < filterMinutes) return false;
    }
  }

  return true;
}

function sortRides(
  rides: RideWithDriver[],
  sortBy: RideSortBy
): RideWithDriver[] {
  const list = [...rides];
  if (sortBy === 'lowest_price') {
    return list.sort((a, b) => a.price_cordobas - b.price_cordobas);
  }
  if (sortBy === 'most_seats') {
    return list.sort((a, b) => b.available_seats - a.available_seats);
  }
  return list.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
}

function filterMockRides(
  filters: GetRidesFilters | undefined,
  sortBy: RideSortBy,
  from: number,
  limit: number
): { data: RideWithDriver[]; hasMore: boolean } {
  const filtered = MOCK_RIDES
    .filter((ride) => ride.status === 'active' && ride.available_seats > 0)
    .filter((ride) => !filters?.excludeDriverId || ride.driver_id !== filters.excludeDriverId)
    .filter((ride) => {
      if (filters?.origin && !ride.origin.toLowerCase().includes(filters.origin.toLowerCase())) return false;
      if (filters?.destination && !ride.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
      return passesDateTimeFilter(ride.departure_time, filters?.date, filters?.time);
    });
  const sorted = sortRides(filtered, sortBy);
  return { data: sorted.slice(from, from + limit), hasMore: sorted.length > from + limit };
}

const MOCK_RIDES: RideWithDriver[] = [
  {
    id: 'mock-managua-masaya',
    driver_id: 'mock-driver-1',
    vehicle_id: null,
    origin: 'Managua',
    origin_place_name: 'Metrocentro Managua',
    origin_address: 'Metrocentro, Managua',
    origin_lat: 12.114356,
    origin_lng: -86.236375,
    destination: 'Masaya',
    destination_place_name: 'Parque Central de Masaya',
    destination_address: 'Parque Central, Masaya',
    destination_lat: 11.974992,
    destination_lng: -86.094167,
    route_polyline: null,
    route_distance_meters: 28500,
    route_duration_seconds: 2400,
    meeting_point: 'Metrocentro Managua',
    meeting_point_lat: 12.114356,
    meeting_point_lng: -86.236375,
    departure_time: new Date(Date.now() + 3600 * 1000 * 3).toISOString(),
    estimated_arrival_time: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
    available_seats: 3,
    price_cordobas: 80,
    notes: 'Salida puntual',
    status: 'active',
    created_at: new Date().toISOString(),
    driver: {
      id: 'mock-driver-1',
      full_name: 'Carlos Morales',
      phone: '50588881234',
      city: 'Managua',
      avatar_url: null,
      rating: 4.9,
      completed_rides: 58,
      onboarding_completed_at: new Date().toISOString(),
      university: null,
      student_id: null,
      created_at: new Date().toISOString(),
    },
    vehicle: null,
  },
];
