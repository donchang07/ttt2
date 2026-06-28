# 운영 확인 (Day17 산출물 A-17-O1)

확인 일시: 2026-06-28 · 3곳(Supabase 이벤트 로그 · Vercel 런타임 로그 · Slack 알림).

## 1. Supabase SQL 확인
- 위치: Supabase 프로젝트 SQL Editor (`nujyfmrawlutenuatnzt`)
- 쿼리:
  ```sql
  select event_type, count(*) cnt from activity_logs
  where created_at >= now() - interval '24 hours'
  group by event_type order by cnt desc;
  ```
- 결과(prod 실측, 2026-06-28): `task.created` 2 · `task.assigned` 1 · `error.task_assign` 1 (24h 총 4건). 카탈로그 3개 이벤트 모두 실재.
- 인덱스 4종 적용 확인: `idx_activity_logs_created_at`·`_event_created_at`·`_event_type`·`_user_created`(+ pkey).

## 2. Vercel Runtime Logs 확인
- 위치: `vercel.com/don-changs-projects/ttt2/logs` (또는 `vercel logs`)
- 확인: `POST /api/...`·서버액션 요청 기록, `[event] write failed`·`[alert] Slack 전송 실패` 0건 기대.

## 3. Slack 알림 수신
- 채널: `SLACK_WEBHOOK_URL` 연결 채널
- 점검: `POST /api/test-alert` (토큰 보호) → `{ ok: true }` 응답 + 채널에 info 알림(errorCode·operation·시각만, PII 없음).
- 상태: ✅ **수신 확인(prod 실측, 2026-06-28)** — `https://ttt2-theta.vercel.app/api/test-alert`
  - 토큰 정상: `{"ok":true,"status":200}` (Slack 200 응답, `INFO 알림: TaskFlow 테스트 알림…` 도착)
  - 토큰 없음: `403`(`권한 없음`) — POST+토큰 보호 동작 확인
  - payload는 `errorCode=TEST_ALERT operation=test-alert` + 시각만(PII·stack 없음).

## 보안 점검(제출 전 4항)
- [x] event_data 허용 필드만(ID·코드, 이메일·이름·키 없음)
- [x] 알림 payload errorCode·operation·시각만(stack·context 전체 금지, `redactSensitive` 마스킹)
- [x] 문서·캡처에 webhook URL·secret·실제 사용자명 없음
- [x] RLS: 일반 사용자 `activity_logs` SELECT 0행(admin-only), 관리자만 전체(Day14 `admin_access_check.md` 실측)
