-- RLS with SECURITY DEFINER helpers (avoid members self-reference recursion)
create or replace function public.user_team_ids()
returns setof uuid language sql security definer set search_path = public stable
as $$ select team_id from public.members where user_id = auth.uid() $$;
create or replace function public.is_team_leader(p_team uuid)
returns boolean language sql security definer set search_path = public stable
as $$ select exists(select 1 from public.members
  where team_id = p_team and user_id = auth.uid() and role = 'leader') $$;
grant execute on function public.user_team_ids() to authenticated;
grant execute on function public.is_team_leader(uuid) to authenticated;

alter table public.teams   enable row level security;
alter table public.members enable row level security;
alter table public.tasks   enable row level security;
alter table public.notes   enable row level security;

create policy teams_select on public.teams for select to authenticated
using (id in (select public.user_team_ids()));
create policy members_select on public.members for select to authenticated
using (team_id in (select public.user_team_ids()));
create policy tasks_select on public.tasks for select to authenticated
using (team_id in (select public.user_team_ids()) and deleted_at is null);
create policy tasks_insert on public.tasks for insert to authenticated
with check (team_id in (select public.user_team_ids()) and created_by = auth.uid());
create policy tasks_update on public.tasks for update to authenticated
using (team_id in (select public.user_team_ids())
  and (created_by = auth.uid() or public.is_team_leader(team_id)))
with check (team_id in (select public.user_team_ids()));
create policy tasks_delete on public.tasks for delete to authenticated
using (team_id in (select public.user_team_ids())
  and (created_by = auth.uid() or public.is_team_leader(team_id)));
create policy notes_select on public.notes for select to authenticated
using (team_id in (select public.user_team_ids()));
create policy notes_insert on public.notes for insert to authenticated
with check (team_id in (select public.user_team_ids()) and created_by = auth.uid());
create policy notes_delete on public.notes for delete to authenticated
using (team_id in (select public.user_team_ids())
  and (created_by = auth.uid() or public.is_team_leader(team_id)));
