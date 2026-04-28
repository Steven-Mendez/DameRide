-- Reproduce the Realtime setup used by src/hooks/useRealtime.ts.
-- Supabase local/hosted projects normally include the supabase_realtime publication.

alter table public.rides replica identity full;
alter table public.reservations replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'rides'
    ) then
      alter publication supabase_realtime add table public.rides;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'reservations'
    ) then
      alter publication supabase_realtime add table public.reservations;
    end if;
  end if;
end;
$$;
