# RLS 정책 초안 — TaskFlow (A-04-O2)

작성일: 2026-06-27 · 주의: service_role 키·.env.local 내용·실제 고객정보 미포함. 실제 적용은 Day11.

## 3대 원칙
1. **Default Deny**: RLS 켜고 정책 없으면 0건 반환.
2. **USING vs WITH CHECK**: USING=기존 행 조회/판단(SELECT·UPDATE·DELETE), WITH CHECK=새로 쓰는 행 검증(INSERT·UPDATE).
3. **권한 계층**: `anon`(비로그인, 접근 불가) / `authenticated`(멤버십 기준) / `service_role`(RLS 우회, 서버 전용 — 브라우저 노출 금지).

## 헬퍼: 내 팀 집합
```sql
-- auth.uid() 가 속한 team_id 목록
-- (members 를 경유해 팀 일치 여부 판단)
-- 예: team_id in (select team_id from public.members where user_id = auth.uid())
```

## 권한표
| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| teams | 내가 멤버인 팀 | (서버/가입 플로우) | leader | leader |
| members | 같은 팀 멤버 | leader(또는 가입) | leader | leader |
| tasks | 같은 팀 + deleted_at IS NULL | 같은 팀 + created_by=auth.uid() | 작성자 또는 leader | soft delete만(작성자/leader) |
| notes | 같은 팀 | 같은 팀 + created_by=auth.uid() | 작성자 | 작성자 또는 leader |

## CREATE POLICY 초안
```sql
alter table public.teams   enable row level security;
alter table public.members enable row level security;
alter table public.tasks   enable row level security;
alter table public.notes   enable row level security;
-- 위 시점부터 Default Deny (정책 없는 작업은 0건)

-- members: 같은 팀만 조회
create policy members_select on public.members
for select to authenticated
using (
  team_id in (select team_id from public.members where user_id = auth.uid())
);

-- tasks: 같은 팀 + soft delete 필터 (USING)
create policy tasks_select on public.tasks
for select to authenticated
using (
  team_id in (select team_id from public.members where user_id = auth.uid())
  and deleted_at is null
);

-- tasks: 내 팀에만 + 작성자 본인 (WITH CHECK)
create policy tasks_insert on public.tasks
for insert to authenticated
with check (
  team_id in (select team_id from public.members where user_id = auth.uid())
  and created_by = auth.uid()
);

-- tasks: 작성자 또는 같은 팀 leader (USING=기존행, WITH CHECK=수정후행 팀 유지)
create policy tasks_update on public.tasks
for update to authenticated
using (
  team_id in (select team_id from public.members where user_id = auth.uid())
  and (
    created_by = auth.uid()
    or exists (
      select 1 from public.members m
      where m.team_id = tasks.team_id and m.user_id = auth.uid() and m.role = 'leader'
    )
  )
)
with check (
  team_id in (select team_id from public.members where user_id = auth.uid())
);

-- notes: 같은 팀 조회
create policy notes_select on public.notes
for select to authenticated
using (
  team_id in (select team_id from public.members where user_id = auth.uid())
);
create policy notes_insert on public.notes
for insert to authenticated
with check (
  team_id in (select team_id from public.members where user_id = auth.uid())
  and created_by = auth.uid()
);
```

## USING / WITH CHECK 가 필요한 이유
- `tasks_select`: 이미 존재하는 행 중 "내 팀 + 미삭제"만 보여야 함 → **USING**.
- `tasks_insert`: 새로 쓰는 행이 "내 팀이고 작성자가 나"인지 검증 → **WITH CHECK** (기존 행이 없으므로 USING 불가).
- `tasks_update`: 기존 행 접근 권한(USING) + 수정 결과가 여전히 내 팀(WITH CHECK) 둘 다 필요.

## 계정 A/B 검증 케이스 (3개)
1. **A팀 사용자 → B팀 tasks SELECT → 0건** (team_id 불일치로 USING 탈락)
2. **B팀 사용자 → A팀 task UPDATE → 0 rows affected** (차단)
3. **SQL Editor(service_role) → 전체 조회 가능** ⚠️ service_role은 RLS 우회 → 서버 전용, 브라우저/GitHub 노출 금지
