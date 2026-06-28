# 운영 알림 점검 (Day14 산출물, 선택)

작성일: 2026-06-28 · 갱신: 2026-06-28 · 상태: **구현·배포 완료**(Vercel `SLACK_WEBHOOK_URL` 설정, 실제 발송 동작). Day13 워크플로 `notify` 단계와 동일 메커니즘 재사용.

## 발송 경로
- `src/lib/workflow/steps.ts` → `notifyStep`(optional). `fetch(SLACK_WEBHOOK_URL, POST json)`으로 Slack 전송, 응답 비정상 시 `NOTIFY_FAILED` 처리.
- 워크플로 엔진(`engine.ts`)에서 `optional` 단계라 실패해도 본 흐름은 중단되지 않음(skipped 처리).

## 웹훅 위치
- `SLACK_WEBHOOK_URL` → `.env.local`(서버 전용, gitignore) / Vercel 환경변수. **코드·문서·캡처에 URL 미기재.** 미설정 환경에선 "Slack 미설정 → 알림 생략"으로 자동 우회.

## 알림 내용(실제 전송 필드)
- RAG 답변 첫 3줄(비어있지 않은 줄) + 발생 시각(Asia/Seoul) + 소요시간(ms) + 토큰 수·예상 비용(opus/haiku/embed 분해).
- 원문·PII는 전송 전 마스킹(아래 보안 게이트).

## 보안 게이트
- 발송 전 `securityGate`의 `redactSensitive`로 마스킹, `scanSensitive`로 포함 패턴 플래그.
- 대상 패턴: email · phone · anthropic_key(`sk-ant-`) · openai_key(`sk-`) · supabase_key(`sb_secret/publishable_`) · slack_webhook(`hooks.slack.com/services/...`). 매치 시 `[REDACTED:name]` 치환.

## 알림 조건(운영 오류 연동, 설계)
| 조건 | 임계 | 동작 |
|---|---|---|
| `error.*` 급증 | 5분 내 동일 코드 ≥ 5건 | Slack 경보 1회 |
| 배정 실패 | `error.task_assign` 발생 | 경보(중요 플로우) |

비고: 위 운영 오류 → Slack 연동은 Day13 발송 인프라(검증 완료)를 재사용하는 확장으로, `activity_logs` 급증 감지 트리거만 추가하면 동작. Day15 후보로 이관.

## 홍수 방지(flood prevention)
- 동일 오류코드는 **5분당 1회**만 발송(쿨다운). 카운트는 묶어서 "N건"으로 전송.
- 단건 폭주 시 개별 발송 금지 → 윈도우 집계 후 1건.
- Slack 429/5xx는 상태 코드만 로그로 남기고 재발송하지 않음.
