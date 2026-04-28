-- Seed data for local/dev testing.
-- This seed uses existing auth users so it works after a fresh reset.

with user_pool as (
  select id, row_number() over (order by created_at, id) as rn
  from auth.users
  where lower(coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', '')) not like '%steven%mendez%'
    and lower(coalesce(email, '')) not like '%steven%'
  order by created_at, id
  limit 4
),
profile_payload as (
  select
    id,
    case rn
      when 1 then 'Carlos Morales'
      when 2 then 'Ana Lopez'
      when 3 then 'Maria Ruiz'
      else 'Jose Perez'
    end as full_name,
    case rn
      when 1 then '50588881234'
      when 2 then '50588884567'
      when 3 then '50588887890'
      else '50588880123'
    end as phone,
    case rn
      when 1 then 'Managua'
      when 2 then 'Masaya'
      when 3 then 'Granada'
      else 'Leon'
    end as city,
    case rn
      when 1 then 4.9::numeric(2,1)
      when 2 then 4.8::numeric(2,1)
      when 3 then 5.0::numeric(2,1)
      else 4.7::numeric(2,1)
    end as rating,
    case rn
      when 1 then 58
      when 2 then 39
      when 3 then 42
      else 21
    end as completed_rides
  from user_pool
)
insert into public.profiles (id, full_name, phone, city, avatar_url, rating, completed_rides)
select id, full_name, phone, city, null, rating, completed_rides
from profile_payload
on conflict (id) do update
set
  full_name = excluded.full_name,
  phone = excluded.phone,
  city = excluded.city,
  avatar_url = excluded.avatar_url,
  rating = excluded.rating,
  completed_rides = excluded.completed_rides;

with drivers as (
  select id, row_number() over (order by id) as rn
  from public.profiles
  order by id
  limit 4
)
insert into public.vehicles (id, owner_id, make, model, color, plate, seats, photo_url)
select
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'vehicle-' || d.id::text),
  d.id,
  case d.rn when 1 then 'Toyota' when 2 then 'Kia' when 3 then 'Hyundai' else 'Nissan' end,
  case d.rn when 1 then 'Corolla' when 2 then 'Rio' when 3 then 'Accent' else 'Versa' end,
  case d.rn when 1 then 'Gris' when 2 then 'Azul' when 3 then 'Blanco' else 'Rojo' end,
  case d.rn when 1 then 'M 12345' when 2 then 'MY 9087' when 3 then 'GR 5521' else 'LE 7142' end,
  4,
  null
from drivers d
on conflict (id) do update
set
  owner_id = excluded.owner_id,
  make = excluded.make,
  model = excluded.model,
  color = excluded.color,
  plate = excluded.plate,
  seats = excluded.seats,
  photo_url = excluded.photo_url;

delete from public.rides
where notes like 'Viaje de prueba RideTogether%'
   or driver_id in (
     select id
     from public.profiles
     where lower(coalesce(full_name, '')) like '%steven%mendez%'
   );

with drivers as (
  select id, row_number() over (order by id) as rn
  from public.profiles
  where lower(coalesce(full_name, '')) not like '%steven%mendez%'
  order by id
  limit 4
), route_catalog as (
  select *
  from (values
    (1, 'Managua', 'Metrocentro Managua', 'Pista de la Resistencia, Managua', 12.114356, -86.236375, 'Masaya', 'Parque Central de Masaya', 'Parque Central, Masaya', 11.974992, -86.094167, 'Metrocentro Managua', 12.114356, -86.236375, 28500, 2400, 80, 'wa}hAh`jmOn}CaxB~fEwgDfxGgjIhfFujG'),
    (2, 'Masaya', 'Terminal de buses de Masaya', 'Terminal de buses, Masaya', 11.974100, -86.094400, 'Managua', 'UCA Managua', 'UCA, Managua', 12.104963, -86.270555, 'Terminal de buses de Masaya', 11.974100, -86.094400, 32000, 2900, 90, 'cuahA~hnlO{kFfiGgxGfjI_gEvgDwbBtmI'),
    (3, 'Granada', 'Parque Central de Granada', 'Parque Central, Granada', 11.934407, -85.956024, 'Managua', 'Universidad Centroamericana', 'UCA, Managua', 12.104963, -86.270555, 'Parque Central de Granada', 11.934407, -85.956024, 47000, 3900, 150, 'a}ygAbhskO}pEjcRuj@`zFifFtjGgxGfjIwjHlvN'),
    (4, 'Managua', 'UCA Managua', 'UCA, Managua', 12.104963, -86.270555, 'Leon', 'Terminal de buses de Leon', 'Terminal de buses, Leon', 12.434964, -86.879867, 'UCA Managua', 12.104963, -86.270555, 93000, 7200, 230, '_g{hA|upmOw~G`fJwzLvjYgyNfpZ_hLfvRgjIvpQocAdrN'),
    (5, 'Leon', 'Parque Central de Leon', 'Parque Central, Leon', 12.437870, -86.878040, 'Managua', 'Metrocentro Managua', 'Metrocentro, Managua', 12.114356, -86.236375, 'Parque Central de Leon', 12.437870, -86.878040, 91000, 7000, 220, 'ug|jAvjgqOtuAwfNfjIwpQ~gLgvRfyNgpZvzLwjY~cFu{P'),
    (6, 'Managua', 'Plaza Inter', 'Plaza Inter, Managua', 12.143958, -86.274690, 'Granada', 'Parque Central de Granada', 'Parque Central, Granada', 11.934407, -85.956024, 'Plaza Inter', 12.143958, -86.274690, 45000, 3600, 140, 'wzbiAxoqmOvrF{XvjHmvNfxGgjIhfFujGtj@azF|pEkcR'),
    (7, 'Granada', 'Mercado Municipal de Granada', 'Mercado Municipal, Granada', 11.929880, -85.956650, 'Masaya', 'Mercado de Artesanias de Masaya', 'Mercado de Artesanias, Masaya', 11.971750, -86.096620, 'Mercado Municipal de Granada', 11.929880, -85.956650, 19000, 1700, 70, 'w`ygA`lskOw|B|xIooBneGmVjiG'),
    (8, 'Managua', 'Rotonda La Virgen', 'Rotonda La Virgen, Managua', 12.132550, -86.216710, 'Esteli', 'Parque Central de Esteli', 'Parque Central, Esteli', 13.091850, -86.354690, 'Rotonda La Virgen', 12.132550, -86.216710, 150000, 10800, 320, 'ms`iAlefmOivEeeEwzL_lOgpZwkGgne@vyEwnu@nd@wvb@fjb@qoIxqM'),
    (9, 'Esteli', 'Parque Central de Esteli', 'Parque Central, Esteli', 13.091850, -86.354690, 'Matagalpa', 'Parque Dario', 'Parque Dario, Matagalpa', 12.925590, -85.917470, 'Parque Central de Esteli', 13.091850, -86.354690, 70000, 5400, 180, 'a_|nAxcanO`Ci\fsGojQn{Kgi[hyIqxd@'),
    (10, 'Matagalpa', 'Parque Dario', 'Parque Dario, Matagalpa', 12.925590, -85.917470, 'Managua', 'UCA Managua', 'UCA, Managua', 12.104963, -86.270555, 'Parque Dario', 12.925590, -85.917470, 128000, 9000, 280, '}o{mAdwkkOiyIpxd@nrW_jAvnu@od@fne@wyEfpZvkGvzL~kOvbKtuO')
  ) as routes(route_index, origin, origin_place_name, origin_address, origin_lat, origin_lng, destination, destination_place_name, destination_address, destination_lat, destination_lng, meeting_point, meeting_point_lat, meeting_point_lng, route_distance_meters, route_duration_seconds, price_cordobas, route_polyline)
), ride_slots as (
  select
    day_index,
    slot,
    ((slot - 1) % 4) + 1 as driver_rn,
    slot as route_index,
    date_trunc('day', now() + interval '1 day') + (day_index::text || ' day')::interval + ((6 + slot)::text || ' hour')::interval as departure_time
  from generate_series(0, 13) as day_index
  cross join generate_series(1, 10) as slot
)
insert into public.rides (
  id,
  driver_id,
  vehicle_id,
  origin,
  origin_place_name,
  origin_address,
  origin_lat,
  origin_lng,
  destination,
  destination_place_name,
  destination_address,
  destination_lat,
  destination_lng,
  meeting_point,
  meeting_point_lat,
  meeting_point_lng,
  departure_time,
  estimated_arrival_time,
  route_polyline,
  route_distance_meters,
  route_duration_seconds,
  available_seats,
  price_cordobas,
  notes,
  status
)
select
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'test-ride-' || s.day_index::text || '-' || s.slot::text),
  d.id,
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'vehicle-' || d.id::text),
  r.origin,
  r.origin_place_name,
  r.origin_address,
  r.origin_lat,
  r.origin_lng,
  r.destination,
  r.destination_place_name,
  r.destination_address,
  r.destination_lat,
  r.destination_lng,
  r.meeting_point,
  r.meeting_point_lat,
  r.meeting_point_lng,
  s.departure_time,
  s.departure_time + (r.route_duration_seconds::text || ' second')::interval,
  r.route_polyline,
  r.route_distance_meters,
  r.route_duration_seconds,
  1 + ((s.slot + d.rn) % 4),
  r.price_cordobas + (d.rn * 5),
  'Viaje de prueba RideTogether. Ruta Nicaragua #' || r.route_index::text || '. Confirmar por WhatsApp antes de abordar.',
  'active'
from ride_slots s
join drivers d on d.rn = s.driver_rn
join route_catalog r on r.route_index = s.route_index
on conflict (id) do update
set
  vehicle_id = excluded.vehicle_id,
  origin = excluded.origin,
  origin_place_name = excluded.origin_place_name,
  origin_address = excluded.origin_address,
  origin_lat = excluded.origin_lat,
  origin_lng = excluded.origin_lng,
  destination = excluded.destination,
  destination_place_name = excluded.destination_place_name,
  destination_address = excluded.destination_address,
  destination_lat = excluded.destination_lat,
  destination_lng = excluded.destination_lng,
  meeting_point = excluded.meeting_point,
  meeting_point_lat = excluded.meeting_point_lat,
  meeting_point_lng = excluded.meeting_point_lng,
  departure_time = excluded.departure_time,
  estimated_arrival_time = excluded.estimated_arrival_time,
  route_polyline = excluded.route_polyline,
  route_distance_meters = excluded.route_distance_meters,
  route_duration_seconds = excluded.route_duration_seconds,
  available_seats = excluded.available_seats,
  price_cordobas = excluded.price_cordobas,
  notes = excluded.notes,
  status = excluded.status;

with rider as (
  select id
  from public.profiles
  order by id
  offset 3
  limit 1
),
first_ride as (
  select id, driver_id
  from public.rides
  where status = 'active'
  order by departure_time asc
  limit 1
)
insert into public.reservations (id, ride_id, passenger_id, seats_reserved, status)
select
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'reservation-' || fr.id::text || '-' || r.id::text),
  fr.id,
  r.id,
  1,
  'confirmed'
from first_ride fr
join rider r on r.id <> fr.driver_id
on conflict (id) do update
set
  seats_reserved = excluded.seats_reserved,
  status = excluded.status;

with rider as (
  select id
  from public.profiles
  order by id
  offset 3
  limit 1
),
first_ride as (
  select id, driver_id
  from public.rides
  where status = 'active'
  order by departure_time asc
  limit 1
)
insert into public.ratings (id, ride_id, reviewer_id, reviewed_user_id, score, comment)
select
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'rating-' || fr.id::text || '-' || r.id::text),
  fr.id,
  r.id,
  fr.driver_id,
  5,
  'Viaje muy seguro y puntual.'
from first_ride fr
join rider r on r.id <> fr.driver_id
on conflict (id) do update
set
  score = excluded.score,
  comment = excluded.comment;
