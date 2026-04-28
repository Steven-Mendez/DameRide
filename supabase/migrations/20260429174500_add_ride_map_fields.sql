create extension if not exists postgis with schema extensions;

alter table public.rides
  add column if not exists origin_place_name text,
  add column if not exists origin_address text,
  add column if not exists origin_lat double precision,
  add column if not exists origin_lng double precision,
  add column if not exists destination_place_name text,
  add column if not exists destination_address text,
  add column if not exists destination_lat double precision,
  add column if not exists destination_lng double precision,
  add column if not exists origin_location geography(point, 4326),
  add column if not exists destination_location geography(point, 4326),
  add column if not exists route_polyline text,
  add column if not exists route_distance_meters integer,
  add column if not exists route_duration_seconds integer;

create or replace function public.set_ride_geographies()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.origin_lat is not null and new.origin_lng is not null then
    new.origin_location := st_setsrid(st_makepoint(new.origin_lng, new.origin_lat), 4326)::geography;
  else
    new.origin_location := null;
  end if;

  if new.destination_lat is not null and new.destination_lng is not null then
    new.destination_location := st_setsrid(st_makepoint(new.destination_lng, new.destination_lat), 4326)::geography;
  else
    new.destination_location := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_ride_geographies on public.rides;
create trigger trg_set_ride_geographies
before insert or update on public.rides
for each row
execute function public.set_ride_geographies();

update public.rides
set
  origin_location = case
    when origin_lat is not null and origin_lng is not null
      then st_setsrid(st_makepoint(origin_lng, origin_lat), 4326)::geography
    else null
  end,
  destination_location = case
    when destination_lat is not null and destination_lng is not null
      then st_setsrid(st_makepoint(destination_lng, destination_lat), 4326)::geography
    else null
  end
where true;

create or replace function public.search_rides_nearby(
  p_origin_lat double precision,
  p_origin_lng double precision,
  p_destination_lat double precision,
  p_destination_lng double precision,
  p_radius_meters integer default 5000
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
    and r.origin_location is not null
    and r.destination_location is not null
    and st_dwithin(
      r.origin_location,
      st_setsrid(st_makepoint(p_origin_lng, p_origin_lat), 4326)::geography,
      p_radius_meters
    )
    and st_dwithin(
      r.destination_location,
      st_setsrid(st_makepoint(p_destination_lng, p_destination_lat), 4326)::geography,
      p_radius_meters
    )
  order by
    st_distance(
      r.origin_location,
      st_setsrid(st_makepoint(p_origin_lng, p_origin_lat), 4326)::geography
    ),
    st_distance(
      r.destination_location,
      st_setsrid(st_makepoint(p_destination_lng, p_destination_lat), 4326)::geography
    ),
    r.departure_time asc;
$$;

grant execute on function public.search_rides_nearby(
  double precision,
  double precision,
  double precision,
  double precision,
  integer
) to anon, authenticated;
