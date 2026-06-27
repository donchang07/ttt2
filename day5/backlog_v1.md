# 백로그 v1 — INVEST 20개 (A-05-O2)

작성일: 2026-06-27 · [backlog_v0](../day4/backlog_v0.md) 확장 (BL-011~020)

| ID | 유형 | 사용자 스토리 | PRD 근거 | 관련 테이블 | 완료 기준 |
|---|---|---|---|---|---|
| BL-001 | Must | 이메일 로그인 후 내 팀 진입 | Must 1 | members | 내 팀 데이터만 보임 |
| BL-002 | Must | 팀 생성·멤버 초대 | Must 1 | teams, members | leader가 role 지정 추가 |
| BL-003 | Must | 태스크 생성 | Must 2 | tasks | 목록 즉시 반영 |
| BL-004 | Must | 태스크 목록 조회(미삭제) | Must 2 | tasks | deleted_at NULL만 |
| BL-005 | Must | 태스크 수정/완료 | Must 2 | tasks | status·updated_at |
| BL-006 | Must | 태스크 soft delete | Must 2 | tasks | deleted_at 설정 |
| BL-007 | Must | AI 우선순위·근거 제시 | Must 3 | tasks | priority·ai_reason |
| BL-008 | Security | 팀 단위 RLS 격리 | Must 4 | 전 테이블 | A/B 3케이스 통과 |
| BL-009 | Should | 태스크 노트 | Should | notes | 노트 CRUD |
| BL-010 | Measure | 핵심 이벤트 로깅 | Metrics | 로그 | priority_decided 등 |
| BL-011 | Security | 미들웨어 세션 갱신·보호 라우트 | Constraints 인증 | — | 비로그인 시 /login 리다이렉트 |
| BL-012 | Security | secret 키 서버 전용 격리 | Risks 운영 | — | 클라이언트 번들에 미포함 |
| BL-013 | Quality | 입력 검증(zod) 태스크 폼 | 기술 품질 | tasks | 빈 제목·길이 초과 차단 |
| BL-014 | Quality | 로딩/빈/에러 상태 UI | UX 완성도 | — | 3상태 화면 존재 |
| BL-015 | Measure | AI 추천 채택률 이벤트 | Metrics | 로그 | shown/accepted 기록 |
| BL-016 | Deploy | Vercel 환경변수·자동배포 | Constraints 배포 | — | push 시 prod 갱신 |
| BL-017 | Deploy | GitHub Actions CI(typecheck/lint/build) | Day16 | — | PR에서 검증 통과 |
| BL-018 | Quality | 구조화 로깅(request id) | Day17 | — | JSON 로그·요청 추적 |
| BL-019 | Security | 보안 헤더·기본 하드닝 | Day18 | — | CSP 등 헤더 설정 |
| BL-020 | Operate | 운영 런북·핸드오버 문서 | Day20 | — | 장애 대응 절차 문서화 |
