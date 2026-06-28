-- Day17 관측: activity_logs 인덱스 보강(핸드북 4종 충족)
-- 기존(Day14 day14_admin_console): idx_activity_logs_created_at, idx_activity_logs_event_created_at
-- 보강: event_type 단독, (user_id, created_at desc)
create index if not exists idx_activity_logs_event_type on public.activity_logs (event_type);
create index if not exists idx_activity_logs_user_created on public.activity_logs (user_id, created_at desc);
