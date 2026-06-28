# Day18 런북 입력 (Day17 산출물 A-17-O1)

작성일: 2026-06-28 · 관측 데이터 → 장애 대응 런북으로 이어지는 입력.

## 알림이 오면 확인하는 순서
1. Slack 알림의 `errorCode`·`operation`·시각 확인.
2. Vercel Runtime Logs(`vercel.com/don-changs-projects/ttt2/logs`)에서 같은 시각 오류·스택 찾기.
3. Supabase SQL로 `error.*` 이벤트 빈도 확인:
   ```sql
   select event_type, count(*) from activity_logs
   where event_type like 'error%' and created_at >= now() - interval '1 hour'
   group by event_type;
   ```

## 핵심 이벤트 / 정상 기준
- `task.created`: 하루 0건이면 유입 점검(정상: 매일 1건 이상).
- `task.assigned`: 대량/이상 변경 시 확인.
- `error.task_assign`: 연속 발생 시 배정 경로 점검 + Slack 알림.

## 알림 조건 / 중복 방지 (alert_rule.md 요약)
- error: 같은 errorCode 10분 1회.
- critical: 1분 5회 이상 → 30분 1회.
- warning: 하루 task.created 0건 → 하루 1회.

## 다음에 채울 것 (Day18 보완)
- [ ] `sendAlert` 코드 레벨 쿨다운(activity_logs 기반 최근 동일 알림 조회 후 스킵).
- [ ] `error.task_assign` 발생 시 `sendAlert` 자동 호출 연결(현재 logEvent만).
- [ ] 관리자 콘솔(`/admin`) 지표와 이벤트 집계 연결.
- [ ] AI 우선순위 구현 시 `error.ai_priority_failed` 이벤트·알림 추가.
- [ ] 런북 장애 시나리오별 절차(키 만료·임베딩 한도·PDF 추출 실패) 추가.
