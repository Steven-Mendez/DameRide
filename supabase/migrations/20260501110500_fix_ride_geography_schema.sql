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

create or replace function public.set_ride_geographies()
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
