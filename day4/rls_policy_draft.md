# RLS 정책 초안 — TaskFlow (A-04-O2)

작성일: 2026-06-27 · 기준: [ERD](./ERD.md) · 더미 데이터 기준
⚠️ **service_role 키는 RLS를 우회한다. 브라우저·GitHub·제출물·캡처에 절대 노출 금지(서버 전용).** `.env.local`·실제 고객 정보 미포함.

## 권한 계층
| 역할 | 의미 |
|---|---|
| `anon` | 비로그인. 어떤 테이블도 접근 불가(정책에서 authenticated만 허용) |
| `authenticated` | 로그인 사용자. 자신이 속한 `team_id` 범위만 |
| `service_role` | RLS 우회(관리·서버 작업 전용). 클라이언트 노출 금지 |

## 1) 테이블별 권한표 (SELECT/INSERT/UPDATE/DELETE)
| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| teams | 내가 멤버인 팀 | owner 본인(가입 플로우) | leader | leader |
| members | 같은 팀 멤버 | leader | leader | leader |
| tasks | 같은 팀 + `deleted_at IS NULL` | 내 팀 + `created_by=auth.uid()` | 작성자 또는 같은 팀 leader | 작성자 또는 leader(soft delete 권장) |
| notes | 같은 팀 | 같은 팀 + `author_id=auth.uid()` | 작성자 또는 leader | 작성자 또는 leader |

## 2) CREATE POLICY 초안 (USING vs WITH CHECK 구분)
```sql
-- 모든 테이블 RLS 활성화 (이 시점부터 Default Deny: 정책 없으면 0건)
alter table teams   enable row level security;
alter table members enable row level security;
alter table tasks   enable row level security;
alter table notes   enable row level security;

-- members: 같은 팀만 조회 (USING)
create policy "team_members_can_view_members"
on members for select to authenticated
using (
  team_id in (select team_id from members where user_id = (select auth.uid()))
);

-- tasks SELECT: 같은 팀 + 삭제되지 않은 행만 (USING = 기존 행 조회 판단)
create policy "team_members_can_view_tasks"
on tasks for select to authenticated
using (
  team_id in (select team_id from members where user_id = (select auth.uid()))
  and deleted_at is null
);

-- tasks INSERT: 내 팀에만, 작성자=나로 (WITH CHECK = 새로 쓰는 행 판단)
create policy "team_members_can_create_tasks"
on tasks for insert to authenticated
with check (
  team_id in (select team_id from members where user_id = (select auth.uid()))
  and created_by = (select auth.uid())
);

-- tasks UPDATE: 작성자 또는 같은 팀 leader (USING=기존행 접근, WITH CHECK=수정후 팀 유지)
create policy "creator_or_leader_can_update_tasks"
on tasks for update to authenticated
using (
  created_by = (select auth.uid())
  or exists (
    select 1 from members
    where team_id = tasks.team_id and user_id = (select auth.uid()) and role = 'leader'
  )
)
with check (
  team_id in (select team_id from members where user_id = (select auth.uid()))
);

-- notes SELECT/INSERT
create policy "team_members_can_view_notes"
on notes for select to authenticated
using (team_id in (select team_id from members where user_id = (select auth.uid())));

create policy "team_members_can_create_notes"
on notes for insert to authenticated
with check (
  team_id in (select team_id from members where user_id = (select auth.uid()))
  and author_id = (select auth.uid())
);
```
> 주의(재귀): `members` SELECT 정책이 `members`를 다시 조회하면 Postgres가 무한 재귀 오류를 낼 수 있다. 실제 적용본(Day07)에서는 `SECURITY DEFINER` 헬퍼 함수(`user_team_ids()`)로 우회했다. 초안에서는 가독성을 위해 서브쿼리로 표기.

## 3) USING vs WITH CHECK 가 각각 필요한 이유
| 작업 | USING (기존 행) | WITH CHECK (새 행) | 이유 |
|---|---|---|---|
| SELECT | ✓ | — | 보여줄 기존 행을 필터 |
| INSERT | — | ✓ | 기존 행이 없으므로, 새로 쓰는 행이 규칙에 맞는지 검증 |
| UPDATE | ✓ | ✓ | 접근 가능한 행인지(USING) + 수정 결과가 여전히 내 팀인지(WITH CHECK) |
| DELETE | ✓ | — | 삭제 대상 행 접근 권한만 판단 |

## 4) 계정 A/B 검증 케이스 (3개)
1. **A팀 사용자 → B팀 tasks SELECT → 0건** (team_id 불일치로 USING 탈락 = A팀 데이터가 B팀에 안 보임)
2. **B팀 사용자 → A팀 task UPDATE → 0 rows affected** (작성자도 leader도 아니므로 차단)
3. **service_role(SQL Editor) → 전체 조회 가능** ⚠️ RLS 우회 → 서버 전용, 브라우저/GitHub/캡처 노출 금지
