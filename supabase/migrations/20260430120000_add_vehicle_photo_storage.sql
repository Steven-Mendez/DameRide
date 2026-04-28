insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicles',
  'vehicles',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Vehicle images are public" on storage.objects;
drop policy if exists "Users can upload their vehicle images" on storage.objects;
drop policy if exists "Users can update their vehicle images" on storage.objects;
drop policy if exists "Users can delete their vehicle images" on storage.objects;

create policy "Vehicle images are public"
on storage.objects for select
using (bucket_id = 'vehicles');

create policy "Users can upload their vehicle images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'vehicles'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their vehicle images"
on storage.objects for update to authenticated
using (
  bucket_id = 'vehicles'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'vehicles'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their vehicle images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'vehicles'
  and (storage.foldername(name))[1] = auth.uid()::text
);
