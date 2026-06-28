# slice-plan-writer 개선 노트 (A-08-O5)

작성일: 2026-06-28 (Day08 산출물 사후 보완) · 근거: [skill_test_log.md](./skill_test_log.md), [day08_skill_candidates.md](./day08_skill_candidates.md)

## 1. 스킬에 필요한 개선점
- **per-user vs team 기반 입력 검증**: 현재 sample은 팀 기반이나 실제 slice1은 per-user로 갈렸다. 입력에 "격리 단위(team_id / user_id)"를 명시 필드로 받아 권한 기준 칸에 강제 반영.
- **컬럼명 검증 연결**: `assignee` vs `assignee_id`, `priority` int vs text 등 Day10에서 터진 불일치를 줄이려면, 테이블 입력 시 실제 DB 컬럼과 1차 대조(후보 #4 schema-sync와 연계).
- **오류 흐름 코드화**: 오류 칸을 자유서술 대신 `AUTH-401 / TASK-404 / RULE-409` 같은 코드 표준으로 출력하면 Day10 오류 가이드와 바로 연결.

## 2. Day09 MCP 후보 (외부 도구가 필요한 것)
스킬(로컬 파일·추론)만으로 부족하고 외부 시스템 접근이 필요한 작업:
- **최근 태스크 읽기(read-only)**: DB/외부 소스의 실제 최근 태스크를 도구로 노출 → 우선순위 추천 입력. (Day09 `list_recent_tasks`로 채택)
- **스키마 조회**: 실제 Supabase 테이블·컬럼·RLS를 질의해 schema-sync의 "적용 DB" 열을 자동 채움. 외부(DB) 권한 필요 → MCP 적합.
- 두 후보 모두 **읽기 전용·더미/제한 권한**으로 시작, 쓰기 작업은 제외.
