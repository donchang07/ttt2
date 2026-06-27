-- TaskFlow schema draft (A-04-O1)
-- 작성일: 2026-06-27
-- 실행 순서: FK 의존도 낮은 순 (teams → members → tasks → notes) → 트리거 마지막
-- 적용 상태: 2026-06-27 Day07 진행 중 실제 적용됨.
--   정식 마이그레이션: supabase/migrations/20260627000001_init_taskflow_schema.sql
--   RLS/함수는 별도 파일: ..._02_taskflow_rls_policies.sql, ..._03_harden_functions.sql, ..._04_ensure_personal_team_fn.sql
-- (이 파일은 설계 초안 원본. 적용본은 위 마이그레이션과 동일 내용.)

-- ─────────────────────────────────────────────
-- 1. teams
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- 2. members  (team_id = RLS 기준)
create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'member' check (role in ('leader','member')),
  created_at  timestamptz not null default now(),
  unique (team_id, user_id)
);
create index if not exists members_user_id_idx on public.members(user_id);
create index if not exists members_team_id_idx on public.members(team_id);

-- 3. tasks  (team_id = RLS 기준, soft delete)
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  title       text not null,
  status      text not null default 'todo' check (status in ('todo','doing','done')),
  priority    int,
  ai_reason   text,
  created_by  uuid not null references auth.users(id),
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists tasks_team_id_idx on public.tasks(team_id);
create index if not exists tasks_active_idx on public.tasks(team_id) where deleted_at is null;

-- 4. notes  (team_id = RLS 기준, RAG 대상)
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  task_id     uuid not null references public.tasks(id) on delete cascade,
  body        text not null,
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);
create index if not exists notes_team_id_idx on public.notes(team_id);
create index if not exists notes_task_id_idx on public.notes(task_id);

-- ─────────────────────────────────────────────
-- 5. updated_at 자동 갱신 트리거 (마지막)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
