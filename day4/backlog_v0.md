# 백로그 v0 — INVEST 10개 (A-04-O4)

작성일: 2026-06-27 · Day05에서 BL-011~020로 확장

| ID | 유형 | 사용자 스토리 | PRD 근거 | 관련 테이블 | 완료 기준 |
|---|---|---|---|---|---|
| BL-001 | Must | 이메일로 가입/로그인해 내 팀에 들어간다 | PRD Must 1 | members, auth.users | 로그인 후 내 팀 데이터만 보임 |
| BL-002 | Must | 팀을 만들고 멤버를 초대한다 | PRD Must 1 | teams, members | leader가 멤버 추가, role 지정 |
| BL-003 | Must | 태스크를 만든다(제목·상태) | PRD Must 2 | tasks | 생성 즉시 목록에 표시 |
| BL-004 | Must | 태스크 목록을 본다(미삭제만) | PRD Must 2 | tasks | deleted_at NULL만 조회 |
| BL-005 | Must | 태스크를 수정/완료 처리한다 | PRD Must 2 | tasks | status 변경·updated_at 갱신 |
| BL-006 | Must | 태스크를 soft delete 한다 | PRD Must 2 | tasks | deleted_at 설정, 목록서 사라짐 |
| BL-007 | Must | AI가 우선순위와 근거를 제시한다 | PRD Must 3 | tasks(priority, ai_reason) | priority·ai_reason 채워짐 |
| BL-008 | Security | 팀 단위로 데이터가 격리된다 | PRD Must 4 | 전 테이블 | A/B 검증 3케이스 통과 |
| BL-009 | Should | 태스크에 노트를 단다 | PRD Should | notes | 노트 생성·조회 |
| BL-010 | Measure | 핵심 이벤트를 로깅한다 | PRD Success Metrics | (로그) | priority_decided 등 기록 |
