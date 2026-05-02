-- WARNING:
-- This baseline is destructive by design.
-- It rebuilds the public schema for fresh local/non-production environments.
-- Do not push this baseline to an existing production database.

create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists postgis with schema public;

-- Drop auth trigger first to avoid dangling references while recreating tables/functions.
drop trigger if exists on_auth_user_created on auth.users;

do $$
begin
  if to_regclass('public.rides') is not null then
    drop trigger if exists trg_update_ride_locations on public.rides;
    drop trigger if exists trg_set_ride_geographies on public.rides;
  end if;
end;
$$;

-- Drop custom functions that may depend on tables.
drop function if exists public.cancel_reservation(uuid, uuid);
drop function if exists public.reserve_seat(uuid, uuid, integer);
drop function if exists public.search_rides_nearby(double precision, double precision, double precision, double precision, double precision);
drop function if exists public.search_rides_nearby(double precision, double precision, double precision, double precision, integer);
drop function if exists public.update_ride_locations();
drop function if exists public.set_ride_geographies();
drop function if exists public.handle_new_user();

-- Recreate core tables.
drop table if exists public.ratings cascade;
drop table if exists public.reservations cascade;
drop table if exists public.rides cascade;
drop table if exists public.vehicles cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  avatar_url text,
  rating numeric(2, 1) not null default 5.0,
  completed_rides integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default extensions.uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  make text not null,
  model text not null,
  color text,
  plate text,
  seats integer not null default 4,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.rides (
  id uuid primary key default extensions.uuid_generate_v4(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  origin text not null,
  origin_place_name text,
  origin_address text,
  origin_lat double precision,
  origin_lng double precision,
  origin_location geography(point, 4326),
  destination text not null,
  destination_place_name text,
  destination_address text,
  destination_lat double precision,
  destination_lng double precision,
  destination_location geography(point, 4326),
  meeting_point text,
  meeting_point_lat double precision,
  meeting_point_lng double precision,
  departure_time timestamptz not null,
  estimated_arrival_time timestamptz,
  route_polyline text,
  route_distance_meters integer,
  route_duration_seconds integer,
  available_seats integer not null default 3,
  price_cordobas integer not null default 0,
  notes text,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default extensions.uuid_generate_v4(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  seats_reserved integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default extensions.uuid_generate_v4(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Performance indexes.
create index idx_profiles_city on public.profiles(city);
create index idx_vehicles_owner on public.vehicles(owner_id);
create index idx_rides_driver on public.rides(driver_id);
create index idx_rides_vehicle on public.rides(vehicle_id);
create index idx_rides_status on public.rides(status);
create index idx_rides_departure on public.rides(departure_time);
create index idx_rides_origin_text on public.rides using gin (to_tsvector('simple', coalesce(origin, '')));
create index idx_rides_destination_text on public.rides using gin (to_tsvector('simple', coalesce(destination, '')));
create index idx_rides_origin_location on public.rides using gist (origin_location);
create index idx_rides_destination_location on public.rides using gist (destination_location);
create index idx_reservations_passenger on public.reservations(passenger_id);
create index idx_reservations_ride on public.reservations(ride_id);
create index idx_reservations_status on public.reservations(status);
create index idx_ratings_ride on public.ratings(ride_id);

-- Trigger to hydrate geography columns from lat/lng.
create or replace function public.update_ride_locations()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.origin_lat is not null and new.origin_lng is not null then
    new.origin_location := public.st_setsrid(public.st_makepoint(new.origin_lng, new.origin_lat), 4326)::public.geography;
  else
    new.origin_location := null;
  end if;

  if new.destination_lat is not null and new.destination_lng is not null then
    new.destination_location := public.st_setsrid(public.st_makepoint(new.destination_lng, new.destination_lat), 4326)::public.geography;
  else
    new.destination_location := null;
  end if;

  return new;
end;
$$;

create trigger trg_update_ride_locations
before insert or update of origin_lat, origin_lng, destination_lat, destination_lng
on public.rides
for each row
execute function public.update_ride_locations();

-- Auth profile bootstrap.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'city', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Core booking functions.
create or replace function public.reserve_seat(
  p_ride_id uuid,
  p_passenger_id uuid,
  p_seats integer default 1
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_available integer;
  v_reservation_id uuid;
begin
  select available_seats into v_available
  from public.rides
  where id = p_ride_id and status = 'active'
  for update;

  if v_available is null then
    raise exception 'Ride not found or not active';
  end if;

  if v_available < p_seats then
    raise exception 'Not enough seats available. Available: %, Requested: %', v_available, p_seats;
  end if;

  insert into public.reservations (ride_id, passenger_id, seats_reserved, status)
  values (p_ride_id, p_passenger_id, p_seats, 'confirmed')
  returning id into v_reservation_id;

  update public.rides
  set available_seats = available_seats - p_seats
  where id = p_ride_id;

  return v_reservation_id;
end;
$$;

create or replace function public.cancel_reservation(
  p_reservation_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ride_id uuid;
  v_seats integer;
  v_passenger_id uuid;
  v_status text;
begin
  select ride_id, seats_reserved, passenger_id, status
  into v_ride_id, v_seats, v_passenger_id, v_status
  from public.reservations
  where id = p_reservation_id
  for update;

  if v_passenger_id is null then
    raise exception 'Reservation not found';
  end if;

  if v_passenger_id != p_user_id then
    raise exception 'Not authorized to cancel this reservation';
  end if;

  if v_status = 'cancelled' then
    raise exception 'Reservation already cancelled';
  end if;

  update public.reservations
  set status = 'cancelled'
  where id = p_reservation_id;

  update public.rides
  set available_seats = available_seats + v_seats
  where id = v_ride_id;

  return true;
end;
$$;

create or replace function public.search_rides_nearby(
  search_origin_lat double precision default null,
  search_origin_lng double precision default null,
  search_dest_lat double precision default null,
  search_dest_lng double precision default null,
  radius_meters double precision default 5000
)
returns setof public.rides
language sql
stable
set search_path = public, extensions
as $$
  select r.*
  from public.rides r
  where r.status = 'active'
    and r.available_seats > 0
    and r.departure_time >= now()
    and (
      (search_origin_lat is null or search_origin_lng is null)
      or (
        r.origin_location is not null
        and st_dwithin(
          r.origin_location,
          st_setsrid(st_makepoint(search_origin_lng, search_origin_lat), 4326)::geography,
          radius_meters
        )
      )
    )
    and (
      (search_dest_lat is null or search_dest_lng is null)
      or (
        r.destination_location is not null
        and st_dwithin(
          r.destination_location,
          st_setsrid(st_makepoint(search_dest_lng, search_dest_lat), 4326)::geography,
          radius_meters
        )
      )
    )
  order by
    coalesce(
      (
        case
          when search_origin_lat is not null and search_origin_lng is not null and r.origin_location is not null
            then st_distance(
              r.origin_location,
              st_setsrid(st_makepoint(search_origin_lng, search_origin_lat), 4326)::geography
            )
          else 0
        end
      )
      + (
        case
          when search_dest_lat is not null and search_dest_lng is not null and r.destination_location is not null
            then st_distance(
              r.destination_location,
              st_setsrid(st_makepoint(search_dest_lng, search_dest_lat), 4326)::geography
            )
          else 0
        end
      ),
      0
    ) asc,
    r.departure_time asc;
$$;

grant execute on function public.reserve_seat(uuid, uuid, integer) to authenticated;
grant execute on function public.cancel_reservation(uuid, uuid) to authenticated;
grant execute on function public.search_rides_nearby(double precision, double precision, double precision, double precision, double precision) to anon, authenticated;

-- RLS.
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.rides enable row level security;
alter table public.reservations enable row level security;
alter table public.ratings enable row level security;

create policy "Anyone can view profiles"
on public.profiles for select
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Anyone can view vehicles"
on public.vehicles for select
using (true);

create policy "Owners can insert their vehicles"
on public.vehicles for insert
with check ((select auth.uid()) = owner_id);

create policy "Owners can update their vehicles"
on public.vehicles for update
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their vehicles"
on public.vehicles for delete
using ((select auth.uid()) = owner_id);

create policy "Anyone can view active rides"
on public.rides for select
using (true);

create policy "Drivers can create their own rides"
on public.rides for insert
with check ((select auth.uid()) = driver_id);

create policy "Drivers can update their own rides"
on public.rides for update
using ((select auth.uid()) = driver_id)
with check ((select auth.uid()) = driver_id);

create policy "Drivers can delete their own rides"
on public.rides for delete
using ((select auth.uid()) = driver_id);

create policy "Passengers can view their reservations"
on public.reservations for select
using (
  (select auth.uid()) = passenger_id
  or exists (
    select 1
    from public.rides
    where rides.id = reservations.ride_id
      and rides.driver_id = (select auth.uid())
  )
);

create policy "Passengers can create reservations"
on public.reservations for insert
with check ((select auth.uid()) = passenger_id);

create policy "Passengers can update their reservations"
on public.reservations for update
using ((select auth.uid()) = passenger_id)
with check ((select auth.uid()) = passenger_id);

create policy "Anyone can view ratings"
on public.ratings for select
using (true);

create policy "Users can create ratings"
on public.ratings for insert
with check ((select auth.uid()) = reviewer_id);
