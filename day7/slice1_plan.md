# slice1_plan.md

> slice-plan-writer 스킬 생성 초안 · 입력: `examples/sample-input.md` (더미, 팀 기반)

| 항목 | 내용 |
|------|------|
| Slice 이름 | 팀원이 태스크를 생성해 목록에서 바로 확인한다 |
| 연결 PRD | 팀원이 태스크를 빠르게 생성할 수 있어야 한다 (Must) |
| 백로그 ID | BL-07(task create) · BL-08(task list refresh) |
| 테이블 | tasks (team_id 기준) |
| 권한 기준 | 팀 멤버만 자기 팀 태스크 조회·생성. INSERT: 내 팀 + `created_by = auth.uid()` / SELECT: `team_id ∈ 내 멤버십` |
| 정상 흐름 | /dashboard/tasks 폼에 제목 입력 → server action(getUser → tasks insert) → `revalidatePath('/dashboard/tasks')` → 목록 즉시 표시 |
| 오류 흐름 | ① 빈 제목 → 거부("제목을 입력하세요") ② 로그아웃 상태 → /login 리다이렉트 ③ 다른 팀 태스크 접근 → RLS로 0건 |
| 완료 증거 | 계정 A로 생성한 태스크가 목록에 보이고, 계정 B(다른 팀)에는 안 보임 · `pnpm typecheck·lint·build` 통과 |
