# 운영 알림 점검 (Day14 산출물, 선택)

작성일: 2026-06-28 · 상태: **설계만**(Day13 워크플로 notify와 동일 메커니즘 재사용, 실제 발송은 웹훅 미설정으로 미실행).

## 웹훅 위치
- `SLACK_WEBHOOK_URL` → `.env.local`(서버 전용, gitignore) / Vercel 환경변수. **코드·문서·캡처에 URL 미기재.**

## 알림 조건(제안)
| 조건 | 임계 | 동작 |
|---|---|---|
| `error.*` 급증 | 5분 내 동일 코드 ≥ 5건 | Slack 경보 1회 |
| 배정 실패 | `error.task_assign` 발생 | 경보(중요 플로우) |

## 홍수 방지(flood prevention)
- 동일 오류코드는 **5분당 1회**만 발송(쿨다운). 카운트는 묶어서 "N건"으로 전송.
- 단건 폭주 시 개별 발송 금지 → 윈도우 집계 후 1건.

## 보안 게이트
- 발송 전 Day13 `securityGate`(`redactSensitive`)로 email·전화·API 키·웹훅 URL 마스킹. 원문 로그·PII 미전송.
