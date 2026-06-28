# Day15 PDCA 입력 (Day14 산출물)

작성일: 2026-06-28 · Day15(개선/회고)용 기준선·문제 후보·관찰.

## 기준선 지표(현재)
- 전체 팀: 3 · profiles(사용자): 7 · activity_logs(24h 시드 포함): 4건
- RAG 문서(rag-eval-a): 다수 청크(Day12/PDF 검증분)
- 워크플로 1회 실행(Day13): 4단계 ok, 요약 점수 85

## Top 3 오류/위험 후보
1. **`error.task_assign`** (배정 실패 500) — activity_logs에서 추적. 다발 시 배정 경로 점검.
2. **임베딩/생성 키 의존** — OpenAI/Anthropic 키 만료·한도 시 /notes·/api/workflow 실패. 키 회전·모니터 필요.
3. **PDF 추출 실패**(스캔 이미지 PDF) — 텍스트 0 → 422. 사용자 안내는 되나, OCR 미지원이 한계.

## 실제 사용자 흐름 관찰
- 인증: 회원가입(Confirm email OFF) → 즉시 로그인 → /tasks.
- 핵심 경로: 태스크 생성/배정 → 활동 로그 적재 → 관리자 콘솔에서 가시화.
- RAG: /notes에서 텍스트·PDF 임베딩 → 질문 → 근거 답변.
- 운영: /admin에서 지표·활동·오류 5분 점검.

## 개선 제안(Day15 후보)
- 활동 로그에 워크플로 실행(`workflow.run`)·RAG 질의(`rag.ask`) 이벤트도 적재해 가시성 확대.
- 오류 급증 시 Day13 notify로 Slack 경보 연결(웹훅 설정 시).
- admin 콘솔에 기간 필터·실행별 상세(Day13 8필드) 추가.
