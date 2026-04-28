-- Harden reservation RPCs and add query-path indexes without rebuilding schema.

drop function if exists public.reserve_seat(uuid, uuid, integer);
drop function if exists public.cancel_reservation(uuid, uuid);

create or replace function public.prevent_self_reservation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'cancelled' and exists (
    select 1
    from public.rides
    where rides.id = new.ride_id
      and rides.driver_id = new.passenger_id
  ) then
    raise exception 'Drivers cannot reserve seats on their own rides';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_self_reservation on public.reservations;

create trigger trg_prevent_self_reservation
before insert or update of ride_id, passenger_id, status
on public.reservations
for each row
execute function public.prevent_self_reservation();

create or replace function public.reserve_seat(
  p_ride_id uuid,
  p_seats integer default 1
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_passenger_id uuid := auth.uid();
  v_available integer;
  v_driver_id uuid;
  v_reservation_id uuid;
begin
  if v_passenger_id is null then
    raise exception 'Authentication required';
  end if;

  if p_seats is null or p_seats <= 0 then
    raise exception 'Seats requested must be greater than 0';
  end if;

  select available_seats, driver_id into v_available, v_driver_id
  from public.rides
  where id = p_ride_id and status = 'active'
  for update;

  if v_available is null then
    raise exception 'Ride not found or not active';
  end if;

  if v_driver_id = v_passenger_id then
    raise exception 'Drivers cannot reserve seats on their own rides';
  end if;

  if v_available < p_seats then
    raise exception 'Not enough seats available. Available: %, Requested: %', v_available, p_seats;
  end if;

  insert into public.reservations (ride_id, passenger_id, seats_reserved, status)
  values (p_ride_id, v_passenger_id, p_seats, 'confirmed')
  returning id into v_reservation_id;

  update public.rides
  set available_seats = available_seats - p_seats
  where id = p_ride_id;

  return v_reservation_id;
end;
$$;

create or replace function public.cancel_reservation(
  p_reservation_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_ride_id uuid;
  v_seats integer;
  v_passenger_id uuid;
  v_status text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select ride_id, seats_reserved, passenger_id, status
  into v_ride_id, v_seats, v_passenger_id, v_status
  from public.reservations
  where id = p_reservation_id
  for update;

  if v_passenger_id is null then
    raise exception 'Reservation not found';
  end if;

  if v_passenger_id != v_user_id then
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

grant execute on function public.reserve_seat(uuid, integer) to authenticated;
grant execute on function public.cancel_reservation(uuid) to authenticated;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_rating_range_check') then
    alter table public.profiles
      add constraint profiles_rating_range_check check (rating >= 0 and rating <= 5) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_completed_rides_nonnegative_check') then
    alter table public.profiles
      add constraint profiles_completed_rides_nonnegative_check check (completed_rides >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'vehicles_seats_positive_check') then
    alter table public.vehicles
      add constraint vehicles_seats_positive_check check (seats > 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'rides_available_seats_nonnegative_check') then
    alter table public.rides
      add constraint rides_available_seats_nonnegative_check check (available_seats >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'rides_price_cordobas_nonnegative_check') then
    alter table public.rides
      add constraint rides_price_cordobas_nonnegative_check check (price_cordobas >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'rides_route_distance_meters_nonnegative_check') then
    alter table public.rides
      add constraint rides_route_distance_meters_nonnegative_check check (route_distance_meters is null or route_distance_meters >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'rides_route_duration_seconds_nonnegative_check') then
    alter table public.rides
      add constraint rides_route_duration_seconds_nonnegative_check check (route_duration_seconds is null or route_duration_seconds >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'reservations_seats_reserved_positive_check') then
    alter table public.reservations
      add constraint reservations_seats_reserved_positive_check check (seats_reserved > 0) not valid;
  end if;
end;
$$;

do $$
begin
  drop table if exists pg_temp.cancelled_duplicate_reservations;

  create temp table cancelled_duplicate_reservations on commit drop as
  with ranked_reservations as (
    select
      id,
      row_number() over (
        partition by ride_id, passenger_id
        order by
          case status when 'confirmed' then 0 else 1 end,
          created_at,
          id
      ) as reservation_rank
    from public.reservations
    where status in ('pending', 'confirmed')
  ), cancelled_reservations as (
    update public.reservations r
    set status = 'cancelled'
    from ranked_reservations rr
    where r.id = rr.id
      and rr.reservation_rank > 1
    returning r.ride_id, r.seats_reserved
  )
  select ride_id, sum(seats_reserved)::integer as seats_to_restore
  from cancelled_reservations
  group by ride_id;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'rides'
      and column_name = 'total_seats'
  ) then
    execute '
      update public.rides r
      set available_seats = least(r.total_seats, r.available_seats + d.seats_to_restore)
      from pg_temp.cancelled_duplicate_reservations d
      where r.id = d.ride_id
    ';
  else
    update public.rides r
    set available_seats = r.available_seats + d.seats_to_restore
    from pg_temp.cancelled_duplicate_reservations d
    where r.id = d.ride_id;
  end if;
end;
$$;

create unique index if not exists idx_reservations_unique_active_passenger_ride
on public.reservations (ride_id, passenger_id)
where status in ('pending', 'confirmed');

create index if not exists idx_ratings_reviewer on public.ratings(reviewer_id);
create index if not exists idx_ratings_reviewed_user on public.ratings(reviewed_user_id);

create index if not exists idx_rides_active_departure
on public.rides(departure_time)
where status = 'active' and available_seats > 0;

create index if not exists idx_rides_active_price_departure
on public.rides(price_cordobas, departure_time)
where status = 'active' and available_seats > 0;

create index if not exists idx_rides_active_seats_departure
on public.rides(available_seats desc, departure_time)
where status = 'active';

create index if not exists idx_reservations_passenger_status_created
on public.reservations(passenger_id, status, created_at desc);

create index if not exists idx_reservations_ride_status
on public.reservations(ride_id, status);

notify pgrst, 'reload schema';
