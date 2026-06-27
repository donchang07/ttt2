# MCP 호출 테스트 로그 — list_recent_tasks

| 항목 | 기록 |
|------|------|
| 호출 도구 | list_recent_tasks |
| 입력값 | limit: 5 |
| 출력 요약 | 태스크 5건 반환 (필드: id·title·status·priority·updatedAt). 최근 수정순: #5, #2, #1, #3, #4 |
| 민감정보 포함 여부 | 없음 (demo_tasks 더미 — 이메일·팀 전체·원문 없음) |
| 오류 발생 단계 | 없음 (등록 생략·stdio 직접 구동, 빌드·연결·호출 모두 성공) |
| 다음 조치 | Day10 Slice 2에서 태스크 목록 → 우선순위 추천 초안 입력으로 활용 |
