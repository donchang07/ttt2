# 자동화 후보 (A-04-O3)

작성일: 2026-06-27 · 후보 3개 (DB trigger / Edge Function / Cron)

| # | 유형 | 자동화 | 트리거/주기 | 이유 | 적용 시점 |
|---|---|---|---|---|---|
| 1 | DB Trigger | `tasks.updated_at` 자동 갱신 | BEFORE UPDATE on tasks | 앱 코드에 의존하지 않고 일관 보장 | ✅ 적용됨(2026-06-27) |
| 2 | Edge Function | AI 우선순위 재계산 | 태스크 생성/수정 시 호출 | 무거운 LLM 호출을 서버에서 처리(secret 키 보호) | Day13 |
| 3 | Cron (pg_cron/Scheduled) | soft delete된 tasks 30일 후 hard delete | 매일 1회 | 데이터 정리·저장 비용 관리 | Day17 이후 |

## 보조 후보 (확장)
- DB Trigger: `members` INSERT 시 첫 멤버 자동 `leader` 지정
- Edge Function: 노트 작성 시 임베딩 생성(Day12 RAG 연동)
