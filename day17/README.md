# Day 17 — 관측 가능성 (이벤트 로깅 + 오류 알림)

핸드북 Day17(Track A). 기존 Day13~14 자산(activity_logs·logEvent·Slack notify)을 확장해, **제품 이벤트 로그 + 범용 오류 알림 + 운영 확인**을 관측 세트로 정리.

## 산출물
| 항목 | 위치 |
|---|---|
| 이벤트 카탈로그(실구현 3종) | [event_catalog.md](./event_catalog.md) |
| 스키마(테이블·RLS·인덱스4) | [activity_log_schema.sql](./activity_log_schema.sql) |
| 알림 규칙(조건·등급·중복방지) | [alert_rule.md](./alert_rule.md) |
| 운영 확인(3곳) | [observability_check.md](./observability_check.md) |
| Day18 런북 입력 | [day18_runbook_input.md](./day18_runbook_input.md) |

## 코드
- `src/lib/events/alert.ts` — 범용 `sendAlert()`(Slack, 보안 게이트 마스킹, 허용 필드만, 비차단). **신규**
- `src/app/api/test-alert/route.ts` — POST + `x-test-alert-token` 토큰 보호 점검 라우트. **신규**
- `src/lib/admin/log.ts` — `logEvent()` 재사용(이벤트 로깅, try-catch 비차단). 기존
- `supabase/migrations/20260628000001_activity_logs_indexes.sql` — 인덱스 2종 보강(총 4종)

## 기존 자산 재사용(중복 방지)
- 이벤트 로깅은 Day14 `logEvent()` 그대로(trackServerEvent 역할). 신규 track.ts 미생성.
- Slack 발송 인프라는 Day13 `securityGate` 재사용. `sendAlert`는 워크플로 전용 `notifyStep`과 별개의 범용 알림.

## 남은 작업(교수님 액션)
- `TEST_ALERT_TOKEN` → `.env.local` + Vercel(Production·Preview) 등록 후 재배포.
- 인덱스 마이그레이션 Supabase 적용(`20260628000001`).
- `POST /api/test-alert`로 Slack 수신 확인 → `observability_check.md` 결과 기입.
