-- 직원 디렉터리: 이메일 미노출, 표시 이름(display_name)만
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles select authenticated" on public.profiles;
create policy "profiles select authenticated"
  on public.profiles for select to authenticated using (true);
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id, display_name)
select id, split_part(email, '@', 1) from auth.users
on conflict (id) do nothing;
