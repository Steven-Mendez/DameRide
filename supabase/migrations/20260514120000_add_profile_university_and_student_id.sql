alter table public.profiles
  add column if not exists university text,
  add column if not exists student_id text;
