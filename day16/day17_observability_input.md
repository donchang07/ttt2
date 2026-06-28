# Day17 관측(Observability) 입력 후보 (Day16 산출물 A-16-O4)

작성일: 2026-06-28 · 오늘 배포된 URL·스모크 대상 페이지 기준(추측 금지).

## 1. 핵심 이벤트 (성공 경로)
- **로그인 성공/실패** — `/login`(이메일+비밀번호, Confirm OFF). 성공 시 세션 발급 → `/tasks`.
- **태스크 생성** — `task.created`(activity_logs 적재, `actions.ts`).
- **태스크 배정** — `task.assigned`(activity_logs 적재).
- 관측 위치: `activity_logs` 테이블 + 관리자 콘솔(`/admin`) 집계.

## 2. 에러 로그 (긴급 조치)
- **배정 실패 500** — `error.task_assign`(activity_logs, code `TASK-ASSIGN-500`).
- **AI 키 의존 실패** — `/api/rag/ask`·`/api/workflow`에서 OpenAI/Anthropic 키 만료·한도 시 실패.
- **PDF 추출 실패 422** — `/api/rag/embed-pdf` 스캔 이미지 PDF(텍스트 0) 또는 20MB 초과.
- **환경변수 누락 API 실패** — Vercel Env 미설정 시 런타임 500.

## 3. 응답 시간 (성능)
- **페이지**: `/`(홈, dynamic), `/login`(static), `/tasks`, `/admin` 로딩.
- **API**: `/api/workflow`(다단계, LLM 호출 多 → 최장), `/api/rag/ask`, `/api/rag/embed`.
- 기준: 워크플로는 LLM 호출 누적으로 수 초 단위 → 임계 초과 시 관측 대상.

## 비고
- 위 이벤트·에러·응답시간은 모두 **현재 배포본(`ttt2-theta.vercel.app`)에 실재하는 경로** 기준.
- Day17에서 로깅/알림(Slack notify·activity_logs) 위에 임계·대시보드를 얹어 관측 체계로 확장.
