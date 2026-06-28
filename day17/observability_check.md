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
- 결과(기준선, Day15 실측): `task.created`·`task.assigned`·`error.task_assign` 적재 확인, 24h 4건. _(최신 수치는 SQL Editor 재실행으로 갱신)_

## 2. Vercel Runtime Logs 확인
- 위치: `vercel.com/don-changs-projects/ttt2/logs` (또는 `vercel logs`)
- 확인: `POST /api/...`·서버액션 요청 기록, `[event] write failed`·`[alert] Slack 전송 실패` 0건 기대.

## 3. Slack 알림 수신
- 채널: `SLACK_WEBHOOK_URL` 연결 채널
- 점검: `POST /api/test-alert` (토큰 보호) → `{ ok: true }` 응답 + 채널에 info 알림(errorCode·operation·시각만, PII 없음).
- 상태: ⏳ `TEST_ALERT_TOKEN` 설정 후 수신 확인 예정(아래 명령). 수신되면 결과 기입.

## 보안 점검(제출 전 4항)
- [x] event_data 허용 필드만(ID·코드, 이메일·이름·키 없음)
- [x] 알림 payload errorCode·operation·시각만(stack·context 전체 금지, `redactSensitive` 마스킹)
- [x] 문서·캡처에 webhook URL·secret·실제 사용자명 없음
- [x] RLS: 일반 사용자 `activity_logs` SELECT 0행(admin-only), 관리자만 전체(Day14 `admin_access_check.md` 실측)
