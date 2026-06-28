-- TaskFlow RLS 정책 (Day11 산출물 A-11-O2)
-- 2026-06-28 · 라이브 DB(project nujyfmrawlutenuatnzt) 실측 기반으로 재구성. 키·실데이터 없음.
--
-- 격리 모델(혼합):
--   tasks    = per-user (created_by 기준, 소유자만)
--   teams/members/notes = team 기반 (user_team_ids() 집합)
--   profiles = 인증 사용자 디렉터리(SELECT true, Day10 배정 대상 조회용) + 수정은 본인만
--
-- 헬퍼(SECURITY DEFINER, members 자기참조 RLS 재귀 방지 — 정의는 Day4/Day5 마이그레이션):
--   user_team_ids()           : 호출자가 속한 team_id 집합
--   is_team_leader(p_team uuid): 호출자가 해당 팀 leader 여부

-- 1) RLS 활성화 (전 테이블, Default Deny)
alter table public.tasks    enable row level security;
alter table public.teams    enable row level security;
alter table public.members  enable row level security;
alter table public.notes    enable row level security;
alter table public.profiles enable row level security;

-- 2) tasks — 소유자(created_by)만. SELECT/INSERT/UPDATE/DELETE 4종
create policy "tasks select own" on public.tasks
  for select using (auth.uid() = created_by);
create policy "tasks insert own" on public.tasks
  for insert with check (auth.uid() = created_by);   -- WITH CHECK: 소유자 위조 차단
create policy "tasks update own" on public.tasks
  for update using (auth.uid() = created_by)
            with check (auth.uid() = created_by);
create policy "tasks delete own" on public.tasks      -- Day11 추가
  for delete using (auth.uid() = created_by);

-- 3) teams / members — 소속 팀만 조회
create policy "teams_select" on public.teams
  for select using (id in (select user_team_ids()));
create policy "members_select" on public.members
  for select using (team_id in (select user_team_ids()));

-- 4) notes — 소속 팀 조회·생성, 삭제는 작성자 또는 팀 leader
create policy "notes_select" on public.notes
  for select using (team_id in (select user_team_ids()));
create policy "notes_insert" on public.notes
  for insert with check (team_id in (select user_team_ids()) and created_by = auth.uid());
create policy "notes_delete" on public.notes
  for delete using (team_id in (select user_team_ids())
                    and (created_by = auth.uid() or is_team_leader(team_id)));

-- 5) profiles — 인증 디렉터리(배정 대상 조회), 수정은 본인만
create policy "profiles select authenticated" on public.profiles
  for select using (true);
create policy "profiles update own" on public.profiles  -- Day11 추가
  for update using (id = auth.uid()) with check (id = auth.uid());

-- 6) 자동 프로필 생성 트리거(이미 적용됨)
--   on_auth_user_created AFTER INSERT ON auth.users → public.handle_new_user() (SECURITY DEFINER, search_path='')
--   handle_new_user: insert into profiles(id, display_name=split_part(email,'@',1)) on conflict do nothing
--   Day11 하드닝: 트리거 전용이므로 RPC 노출 제거
--     revoke execute on function public.handle_new_user() from public;

-- 검증 쿼리:
--   select policyname, cmd, qual, with_check from pg_policies where schemaname='public' order by tablename, cmd;
