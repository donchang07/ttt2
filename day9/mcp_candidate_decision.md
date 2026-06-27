# MCP 후보 결정 — TaskFlow (강사 예시)

| # | 항목 | 결정 |
|---|------|------|
| 1 | 연결하려는 외부 시스템 | TaskFlow Supabase DB (demo_tasks 더미 테이블) |
| 2 | Skill로 충분하지 않은 이유 | Skill은 처리 절차 지침일 뿐, 실제 DB 값을 직접 읽어오지 못한다 |
| 3 | 오늘 호출할 도구 1개 | list_recent_tasks (읽기 전용 · 더미) |
| 4 | 더미 데이터 여부 | 더미만 사용 (실제 팀 데이터 없음) |
| 5 | 읽기/쓰기 권한 | 읽기 전용 (insert/update/delete 없음) |
| 6 | Day10 활용 가능성 | Slice 2에서 태스크 목록을 읽어 우선순위 추천 초안 생성에 사용 |
