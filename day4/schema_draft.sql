-- TaskFlow schema draft (A-04-O1)
-- 작성일: 2026-06-27 · 더미 데이터 기준 (실제 고객정보·계약서·실명 미포함)
-- Supabase SQL Editor 실행 순서: teams → members → tasks → notes → 트리거(마지막)
-- 주의: 현재 적용본(Day07)과 컬럼이 다름(owner_id·assignee_id 추가, status='in_progress', notes 형태).
--       적용하려면 별도 마이그레이션 필요. 이 파일은 설계 초안.

-- [1] teams (테넌트 경계)
create table teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references auth.users(id),
  created_at timestamptz default now()
);

-- [2] members (팀 소속, RLS 조회의 기준 = team_id)
create table members (
  id        uuid primary key default gen_random_uuid(),
  team_id   uuid not null references teams(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null check (role in ('leader','member')),
  joined_at timestamptz default now(),
  unique (team_id, user_id)
);

-- [3] tasks (team_id 로 팀 경계 분리, soft delete)
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references teams(id) on delete cascade,
  title       text not null,
  status      text not null default 'todo'
              check (status in ('todo','in_progress','done')),
  priority    int,
  assignee_id uuid references auth.users(id),
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  deleted_at  timestamptz        -- soft delete
);

-- [4] notes (회의록·위키, RAG 대상)
create table notes (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references teams(id) on delete cascade,
  title      text,
  body       text,
  author_id  uuid references auth.users(id),
  updated_at timestamptz default now()
);

-- [5] updated_at 자동 갱신 트리거 (마지막)
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_tasks_updated
before update on tasks
for each row execute function set_updated_at();
