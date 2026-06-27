-- 2026-06-27: tasks를 team 기반 → per-user(created_by) 모델로 재생성
-- 기존 team 기반 tasks(및 notes.task_id FK)를 제거하고 단순 per-user 스키마로 교체.
drop table if exists public.tasks cascade;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'todo',
  priority text not null default 'medium',
  assignee uuid references auth.users(id),
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "tasks insert own"
  on public.tasks for insert
  with check (auth.uid() = created_by);

create policy "tasks select own"
  on public.tasks for select
  using (auth.uid() = created_by);
