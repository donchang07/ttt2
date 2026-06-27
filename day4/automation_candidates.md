# 자동화 후보 (A-04-O3)

작성일: 2026-06-27 · 입력: PRD Must(팀 생성·멤버 초대 / 태스크 CRUD / 역할 기반 접근 / Auth+RLS), Risks(RLS 미설정 노출 / typecheck 오류 / .env.local git 노출)
제약: DB trigger 안에서 Claude 호출·결제·외부 알림 직접 처리 금지. 외부 API·비밀키 필요한 일은 Edge Function 후보로만 표시.

## 후보 3개
| # | 종류 | 자동화 내용 | PRD/Risk 연결 | 이번 주 구현 |
|---|---|---|---|---|
| 1 | **DB trigger** | `tasks` UPDATE 시 `updated_at` 자동 갱신 | 태스크 CRUD(Must) — 일관성, 앱 코드 누락 방지 | **가능** (이미 적용, `trg_tasks_updated`) |
| 2 | **DB trigger** | `teams` INSERT 시 `owner_id`를 leader `members`로 자동 등록 | 팀 생성·역할 기반 접근(Must) — 팀 생성 직후 RLS가 동작하도록 보장(빈 멤버십으로 인한 접근불가 방지) | **가능** (작은 트리거, 외부 호출 없음) |
| 3 | **Edge Function** | AI 우선순위 근거(`priority`·`ai_reason`) 생성 — Claude API 호출 | 차별 기능(우선순위 근거). RLS 위험과 무관하나 **비밀키(Claude) 필요** → 제약상 Edge로만 | **보류** (Claude API 키 미발급, Day13 예정) |

## 제약 준수 메모
- #1·#2는 DB trigger지만 **외부 호출·결제·알림 없음**(순수 DML) → 규칙 충족.
- #3은 외부 API·secret 필요 → **DB trigger 금지, Edge Function 후보로만** 표시(규칙 충족).

## 보조(참고, 이번 주 제외)
- Cron: soft delete된 `tasks`를 30일 후 정리 — 운영 단계(Day17+).
