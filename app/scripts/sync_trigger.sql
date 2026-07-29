-- Run this in the Supabase SQL Editor

-- 1. Create a function that automatically inserts a user into public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, name, phone, auth_provider, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.phone, 'google_' || substring(new.id::text from 1 for 10)), -- Dummy phone if none provided
    'google',
    'user'
  );
  return new;
end;
$$;

-- 2. Create the trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
