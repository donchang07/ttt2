-- Day14 관리자 콘솔 스키마 (마이그레이션 day14_admin_console, 실적용본)
-- 2026-06-28 · Supabase nujyfmrawlutenuatnzt

-- 1) profiles.role (admin RBAC). members.role(leader/member) 팀역할과 별개. 사용자 자가승격 불가(profiles에 UPDATE 정책 없음 → RLS default deny로 차단, role 변경은 관리 경로 SQL만).
alter table public.profiles
  add column role text not null default 'user' check (role in ('user','admin'));

-- 2) is_admin: security 스키마(REST 미노출) + SECURITY DEFINER. RLS 내부에서만 사용.
create schema if not exists security;
create or replace function security.is_admin()
returns boolean
language sql
security definer
set search_path = public, security
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function security.is_admin() from public;
grant execute on function security.is_admin() to authenticated;

-- 3) activity_logs: ID·이벤트만(PII 금지)
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.activity_logs enable row level security;

-- INSERT: 본인 로그만
create policy "activity_logs insert own" on public.activity_logs
  for insert with check (user_id = auth.uid());
-- SELECT: 관리자만 전체 조회(일반 사용자는 0행 → 데이터 레벨 차단)
create policy "activity_logs select admin" on public.activity_logs
  for select using (security.is_admin());

-- 인덱스(집계 쿼리 최적화)
create index idx_activity_logs_created_at on public.activity_logs (created_at desc);
create index idx_activity_logs_event_created_at on public.activity_logs (event_type, created_at desc);

-- 4) teams: 관리자 전체 조회(메트릭용) 오버라이드
drop policy "teams_select" on public.teams;
create policy "teams_select" on public.teams
  for select using (id in (select user_team_ids()) or security.is_admin());

-- 관리자 승격(더미): update public.profiles set role='admin' where id=(select id from auth.users where email='rag-eval-a@taskflow.test');
