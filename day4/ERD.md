# ERD — TaskFlow (A-04-O1)

작성일: 2026-06-27 · 입력: [PRD v1 ## 7](../day3/PRD_v1.md)

## 관계
```
auth.users (Supabase)
   │ 1:N
teams ──< members >── auth.users
  │ 1:N
  ├──< tasks  (★ team_id RLS 기준, created_by → auth.users)
  └──< notes  (★ team_id RLS 기준, task_id → tasks, RAG 대상)
```
- `teams 1:N members`, `teams 1:N tasks`, `teams 1:N notes`
- `tasks 1:N notes` (노트는 태스크에 종속)
- `members`는 `teams`와 `auth.users`의 교차(멤버십 + 역할)

## 엔티티-컬럼-관계-민감도-삭제방식

### teams
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text NOT NULL | 팀명 |
| created_at | timestamptz | default now() |
- 민감도: 낮음 · 삭제: hard(현재 미사용)

### members  ★ team_id
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| team_id | uuid FK→teams | ★ RLS 기준 |
| user_id | uuid FK→auth.users | |
| role | text NOT NULL | 'leader' \| 'member' (CHECK) |
| created_at | timestamptz | |
- UNIQUE(team_id, user_id) · 민감도: 중 · 삭제: hard

### tasks  ★ team_id
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| team_id | uuid FK→teams | ★ RLS 기준 |
| title | text NOT NULL | |
| status | text NOT NULL | 'todo'\|'doing'\|'done' (CHECK), default 'todo' |
| priority | int | AI 추천 우선순위(1=높음), nullable |
| ai_reason | text | AI 우선순위 근거, nullable |
| created_by | uuid FK→auth.users | |
| deleted_at | timestamptz | soft delete |
| created_at | timestamptz | |
| updated_at | timestamptz | 트리거 자동 갱신 |
- 민감도: 중 · 삭제: **soft(deleted_at)**

### notes  ★ team_id (RAG 대상)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| team_id | uuid FK→teams | ★ RLS 기준 |
| task_id | uuid FK→tasks | ON DELETE CASCADE |
| body | text NOT NULL | RAG 임베딩 대상(Day12) |
| created_by | uuid FK→auth.users | |
| created_at | timestamptz | |
- 민감도: 중 · 삭제: hard(태스크 삭제 시 cascade)

## RLS 기준 컬럼 결정
- 제품 성격 = **팀 협업** → "데이터가 새면 가장 곤란한 단위" = 팀
- 따라서 모든 핵심 테이블의 RLS 기준 컬럼 = **`team_id`** (members 경유로 auth.uid() 검증)

## DB 함수 (데이터 계층 — 실제 적용됨)
| 함수 | 종류 | 역할 |
|---|---|---|
| `set_updated_at()` | trigger fn | tasks UPDATE 시 updated_at 자동 갱신 |
| `user_team_ids()` | SECURITY DEFINER | auth.uid()의 team_id 집합 — RLS 재귀 방지 |
| `is_team_leader(team)` | SECURITY DEFINER | 호출자가 해당 팀 leader인지 |
| `ensure_personal_team()` | SECURITY DEFINER | 멤버십 없으면 팀+leader 멤버십 생성(첫 태스크용) |

## 적용 상태
- 2026-06-27 Supabase 프로젝트 `nujyfmrawlutenuatnzt`에 마이그레이션으로 **적용 완료**.
- 적용 파일: `supabase/migrations/20260627000001~000004*.sql`
- 생성 타입: `src/types/database.types.ts`
- 전 테이블 RLS ON, 보안 어드바이저 점검 완료. 상세: [rls_policy_draft.md](./rls_policy_draft.md)
