# Slice 1 계획서 (A-07-O1) — 태스크 등록

작성일: 2026-06-27 · 입력: [PRD Must 2](../day3/PRD_v1.md), [ERD](../day4/ERD.md)

## Slice 행동 정의
> "로그인 사용자가 태스크를 등록하면 `tasks`에 저장되고, 내 팀 태스크 목록에 보인다."

E2E: **폼 입력 → Server Action → (인증·검증·팀 보장) → DB INSERT → revalidatePath → 목록 갱신**

## 8칸 설계표
| 항목 | 내용 |
|---|---|
| 사용자 행동 | 제목 입력 후 "추가" 클릭 |
| 입력 데이터 | title (2~80자) |
| 처리 | getUser() → ensure_personal_team() → tasks INSERT |
| 저장 위치 | `public.tasks` (team_id, title, created_by) |
| 권한/RLS | INSERT: `team_id ∈ user_team_ids() AND created_by = auth.uid()` |
| created_by | **서버에서 user.id 강제** (폼 hidden 신뢰 금지) |
| 출력 | 내 팀 태스크 목록(최신순), RLS로 타 팀 차단 |
| 증거(측정) | INSERT 성공 → 목록 count 증가, A/B 격리 0건 |

## 구현 파일
- `src/features/auth/{actions.ts, login-form.tsx}` + `src/app/(auth)/login/page.tsx`
- `src/middleware.ts` + `src/lib/supabase/middleware.ts` (세션 갱신)
- `src/features/tasks/{actions.ts, queries.ts, components/create-task-form.tsx}`
- `src/app/(dashboard)/tasks/page.tsx`
- DB: `ensure_personal_team()` (SECURITY DEFINER) — `supabase/migrations/...04`

## 범위 (핸드북 기준)
- ✅ 인증(이메일 로그인) · DB(tasks+RLS) · UI(폼+목록)
- ✗ 회원 관리·수정/삭제·검색은 Day 10+ (이번 슬라이스 제외)
- 비고: 우리 스키마가 팀 기반이라 `created_by` 단순 정책 대신 **team_id RLS + ensure_personal_team()** 로 구현(핸드북 예시보다 정확한 멀티테넌트).
