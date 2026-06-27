# Slice 1 계획서 (A-07-O1)

작성일: 2026-06-27 · 입력: [PRD_v1](../day3/PRD_v1.md), [backlog_v1](../day5/backlog_v1.md), [ERD](../day4/ERD.md)
Slice는 **"한 사람이 한 번 하는 행동"** 하나로 좁힌다(기능 이름 아님).

| # | 항목 | 내용 |
|---|---|---|
| 1 | **Slice 이름(사용자 행동)** | "사용자가 할 일(태스크)을 등록한다" |
| 2 | **연결 PRD Must** | Must 2 (태스크 CRUD) — 이 슬라이스는 그중 **'등록'만** |
| 3 | **연결 백로그(BL-ID)** | **BL-003**(태스크 생성). 증거에 BL-004(목록 조회)·BL-008(RLS 격리) 사용 |
| 4 | **테이블(주요 컬럼)** | `tasks`(team_id, title, status, created_by, deleted_at) |
| 5 | **권한 기준** | **INSERT**: 로그인 사용자가 내 팀에 + `created_by = auth.uid()`(서버 강제) / **SELECT**: 같은 팀 + `deleted_at IS NULL` (RLS) |
| 6 | **정상 흐름** | `/tasks` 폼에 제목 입력 → "추가" → server action(getUser → `ensure_personal_team` → `tasks` insert) → `revalidatePath('/tasks')` → 목록 즉시 표시 |
| 7 | **오류 흐름** | ① 빈/짧은 제목 → "2~80자" 오류, 저장 안 됨 ② 로그아웃 상태로 `/tasks` 접근 → `/login` 리다이렉트(307) ③ 타 팀 데이터 접근 → RLS로 **0건**(불가) |
| 8 | **완료 증거** | ① localhost `/tasks`에서 등록·즉시 표시 동작 ② 계정 A/B: B가 A의 태스크 **0건** ③ `pnpm typecheck·lint·build` 통과 |

> 범위 제한: 수정/완료(BL-005)·삭제(BL-006)·AI 우선순위(BL-007)는 **이 슬라이스에서 제외**(별도 슬라이스). "등록 후 목록에 보인다"까지만.
