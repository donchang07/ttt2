create or replace function public.ensure_personal_team()
returns uuid language plpgsql security definer set search_path = public as $$
declare t uuid;
begin
  select team_id into t from public.members where user_id = auth.uid() limit 1;
  if t is not null then return t; end if;
  insert into public.teams(name) values ('내 팀') returning id into t;
  insert into public.members(team_id, user_id, role) values (t, auth.uid(), 'leader');
  return t;
end;
$$;
revoke execute on function public.ensure_personal_team() from public, anon;
grant execute on function public.ensure_personal_team() to authenticated;
