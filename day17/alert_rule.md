# 알림 규칙 (Day17 산출물 A-17-O1)

작성일: 2026-06-28 · 발송: `src/lib/events/alert.ts`의 `sendAlert()`(Slack Webhook, 보안 게이트 마스킹). 점검: `POST /api/test-alert`(토큰 보호).

## 알림 조건·등급·중복 방지
| 알림 조건 | 등급 | 중복 방지 |
|---|---|---|
| 핵심 기능 오류(예: `error.task_assign`) | error | 같은 errorCode 10분 1회 |
| 1분에 오류 5회 이상 | critical | 같은 기능 30분 1회 |
| 하루 `task.created` 0건 | warning | 하루 1회 |
| 연동 점검(`test-alert`) | info | 수동 호출 시에만 |

## payload 허용 필드(그 외 금지)
- 허용: `message`(마스킹), `level`, `errorCode`, `operation`, 발생 시각.
- 금지: 이메일·고객명·전화, API key·토큰·webhook URL, stack trace 전문, context 전체.

## 보안
- webhook URL은 `SLACK_WEBHOOK_URL` 환경변수만(코드·문서·캡처 미기재). 미설정 시 발송 스킵(메인 흐름 비차단).
- 테스트 라우트는 **POST + `x-test-alert-token` 헤더**만 허용(GET 없음). 토큰 불일치 → 403.
- 발송 전 `redactSensitive`로 email·phone·키·webhook 패턴 마스킹.

## 중복 방지 구현 메모
- 현재 `sendAlert`는 전송에 집중(상태 비저장). 위 쿨다운(10분/30분/하루)은 **정책 기준**이며, 코드 레벨 쿨다운은 Day18 런북에서 `activity_logs` 기반 최근 동일 알림 조회로 확장 예정.
