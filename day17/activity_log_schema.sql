-- Day17 관측: activity_logs 스키마(실적용 통합본) — 테이블·RLS·인덱스 4종
-- 원천: Day14 day14_admin_console(테이블·RLS·인덱스2) + Day17 20260628000001(인덱스 보강2)

-- 테이블: ID·이벤트만(PII 금지). session_id 미채택(user_id로 충분).
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.activity_logs enable row level security;

-- RLS: INSERT 본인만 / SELECT 관리자만(데이터 레벨 이중 방어, security.is_admin)
-- 핸드북 '본인 SELECT' 대신 admin-only 채택 — 관리자 콘솔 중심 설계(일반 사용자는 본인 것도 0행, 더 강한 격리).
create policy "activity_logs insert own" on public.activity_logs
  for insert with check (user_id = auth.uid());
create policy "activity_logs select admin" on public.activity_logs
  for select using (security.is_admin());

-- 인덱스 4종(집계 쿼리 최적화)
create index if not exists idx_activity_logs_created_at on public.activity_logs (created_at desc);
create index if not exists idx_activity_logs_event_created_at on public.activity_logs (event_type, created_at desc);
create index if not exists idx_activity_logs_event_type on public.activity_logs (event_type);
create index if not exists idx_activity_logs_user_created on public.activity_logs (user_id, created_at desc);

-- 검증:
--   select * from activity_logs order by created_at desc limit 5;          -- 행 확인
--   select * from pg_policies where tablename='activity_logs';            -- RLS 정책 2종
--   select indexname from pg_indexes where tablename='activity_logs';     -- 인덱스 4종
