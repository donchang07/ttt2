# 이벤트 카탈로그 (Day17 산출물 A-17-O1)

작성일: 2026-06-28 · Track A(기존 코드). **실제 구현된 이벤트** 기준(추측 금지). 로깅 함수: `src/lib/admin/log.ts`의 `logEvent()`(=trackServerEvent 역할, try-catch 비차단).

## 이벤트 표
| 이벤트명 | 로깅 위치 | 허용 event_data | 조치 기준 |
|---|---|---|---|
| `task.created` | `createTask` 서버액션 (`features/tasks/actions.ts`) | `{ taskId }` | 하루 0건 → 유입 점검 |
| `task.assigned` | `assignTask` 서버액션 | `{ taskId, assignee }` | 대량/이상 변경 시 확인 |
| `error.task_assign` | `assignTask` catch(dbError) | `{ taskId, code }` | 반복 발생 시 Slack 알림 |

## 허용 필드 원칙
- `taskId`·`assignee`는 **UUID(ID)만** — 이메일·이름·전화 없음. `code`는 내부 에러코드(`TASK-ASSIGN-500`).
- 금지: 이메일·전화·실명, API key·토큰·webhook URL, stack trace 전문, 업무번호.

## 이벤트명 컨벤션
- `[domain].[action_past]` 지향. `task.created`·`task.assigned`는 부합. `error.task_assign`은 실제 구현 명칭 유지(에러 도메인).

## 예정(미구현 → 카탈로그에만)
| 이벤트명 | 추가 시점 |
|---|---|
| `error.ai_priority_failed` | AI 우선순위 추천(`src/lib/ai`, `ai_reason`) 구현 후 catch에 연결. 현재 기능 미구현이라 로깅 위치 없음 |

## 비고
- `session_id` 칼럼은 미채택 — 서버 액션 컨텍스트에서 `user_id`로 충분(핸드북상 선택 필드).
