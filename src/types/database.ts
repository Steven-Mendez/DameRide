export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  rating: number;
  completed_rides: number;
  onboarding_completed_at: string | null;
  university: string | null;
  student_id: string | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  color: string | null;
  plate: string | null;
  seats: number;
  photo_url: string | null;
  created_at: string;
}

export interface Ride {
  id: string;
  driver_id: string;
  vehicle_id: string | null;
  origin: string;
  origin_place_name: string | null;
  origin_address: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  destination: string;
  destination_place_name: string | null;
  destination_address: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
  route_polyline: string | null;
  route_distance_meters: number | null;
  route_duration_seconds: number | null;
  meeting_point: string | null;
  meeting_point_lat: number | null;
  meeting_point_lng: number | null;
  departure_time: string;
  estimated_arrival_time: string | null;
  available_seats: number;
  price_cordobas: number;
  notes: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Reservation {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats_reserved: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Rating {
  id: string;
  ride_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  score: number;
  comment: string | null;
  created_at: string;
}

// Joined types for UI display
export interface RideWithDriver extends Ride {
  driver: Profile;
  vehicle: Vehicle | null;
}

export interface ReservationWithDetails extends Reservation {
  ride: Ride;
  driver: Profile;
  vehicle: Vehicle | null;
}

export interface MapPointSelection {
  latitude: number;
  longitude: number;
  placeName?: string;
  address?: string;
}
