# ERD — TaskFlow (A-04-O1)

작성일: 2026-06-27 · 입력: [PRD v1 ## 7 전달표](../day3/PRD_v1.md)
제품: TaskFlow (5~15인 소규모 팀 태스크 관리 SaaS, AI 우선순위 근거 제시) · 역할: leader / member (Supabase Auth)
RLS 기준 컬럼: **`team_id`** (members·tasks·notes 공통 — "데이터가 새면 가장 곤란한 단위 = 팀")

## 관계
```
auth.users (Supabase Auth)
   │ 1:N (owner_id / user_id / assignee_id / created_by / author_id)
teams ──< members >── auth.users
  │ 1:N
  ├──< tasks   (★ team_id, assignee_id→auth.users, created_by→auth.users)
  └──< notes   (★ team_id, author_id→auth.users, RAG 대상)
```
- `teams.owner_id → auth.users` (팀 소유자)
- `members`는 teams × auth.users 교차(멤버십+역할), UNIQUE(team_id,user_id)

## (1) 엔티티 — 컬럼 — 관계 — 민감도 — 삭제방식

### teams — 팀(테넌트 경계)
| 컬럼 | 타입 | 관계/제약 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text NOT NULL | 팀명 |
| owner_id | uuid NOT NULL | FK→auth.users(id) |
| created_at | timestamptz | DEFAULT now() |
- 민감도: 낮음 · 삭제: hard

### members — 팀 소속 (★ team_id = RLS 기준)
| 컬럼 | 타입 | 관계/제약 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| team_id | uuid NOT NULL | FK→teams ON DELETE CASCADE ★ |
| user_id | uuid NOT NULL | FK→auth.users ON DELETE CASCADE |
| role | text NOT NULL | CHECK in ('leader','member') |
| joined_at | timestamptz | DEFAULT now() |
- UNIQUE(team_id, user_id) · 민감도: 중 · 삭제: hard

### tasks — 태스크 (★ team_id, soft delete)
| 컬럼 | 타입 | 관계/제약 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| team_id | uuid NOT NULL | FK→teams ON DELETE CASCADE ★ |
| title | text NOT NULL | |
| status | text NOT NULL | CHECK in ('todo','in_progress','done'), default 'todo' |
| priority | int | AI 추천 우선순위, nullable |
| assignee_id | uuid | FK→auth.users, 담당자, nullable |
| created_by | uuid NOT NULL | FK→auth.users, 작성자(=RLS insert 기준) |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | 트리거 자동 갱신 |
| deleted_at | timestamptz | **soft delete** |
- 민감도: 중 · 삭제: **soft (deleted_at)**

### notes — 회의록·위키 (★ team_id, RAG 대상)
| 컬럼 | 타입 | 관계/제약 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| team_id | uuid NOT NULL | FK→teams ON DELETE CASCADE ★ |
| title | text | |
| body | text | RAG 임베딩 대상(Day12) |
| author_id | uuid | FK→auth.users |
| updated_at | timestamptz | DEFAULT now() |
- 민감도: 중 · 삭제: hard

> 더미 데이터 기준. service_role·secret 키·실명·실제 계약 정보 미포함.
> 이 설계는 현재 적용본(Day07)과 다름(owner_id·assignee_id 추가, status='in_progress', notes 형태). 적용 시 별도 마이그레이션 필요.
