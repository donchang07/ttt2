# 워크플로 구현 노트 (Day13 산출물)

작성일: 2026-06-28 · 코드: `src/lib/workflow/{engine,steps,securityGate}.ts`, `src/app/api/workflow/route.ts`
트랙: **A (기존 코드)** — Day12 `searchDocuments()`를 1단계로 사용.

## 엔진 (`engine.ts`)
- `runWorkflow(steps, ctx)`: 단계를 **순차 실행**, 각 단계를 `withTimeout(Promise.race)`로 감쌈.
- 결과는 `StepResult { stepName, status('ok'|'error'|'skipped'), durationMs, errorCode, outputSummary }`로 통일.
- **필수 단계 실패 → halted=true** → 이후 단계 `skipped(HALTED)`. **선택 단계 실패 → skipped**로 로그만 남기고 계속.
- `StepError(code)`로 단계별 오류코드 전달, 타임아웃은 `TIMEOUT`.

## 4단계 (`steps.ts`)
| # | 단계 | 필수/선택 | timeout | 동작 | 오류코드 |
|---|---|---|---|---|---|
| 1 | search | 필수 | 8s | Day12 RAG 검색(threshold 0.3, top-5) | NO_RESULTS |
| 2 | summarize | 필수 | 15s | generate→evaluate 자기개선 루프(아래 별도 노트) | — |
| 3 | report | 필수 | 8s | 마크다운 생성, 로컬만 `reports/날짜-runId.md` 저장(서버리스는 영속 불가) | — |
| 4 | notify | **선택** | 5s | Slack 웹훅 전송(보안 게이트 경유). 미설정 시 생략 | NOTIFY_FAILED |

## 보안 게이트 (`securityGate.ts`)
- 외부 전송(notify) 전 `scanSensitive`/`redactSensitive`로 **email·전화·API 키(sk-/sk-ant-/sb_)·Slack 웹훅 URL** 차단·마스킹.
- API 응답은 인증 사용자 본인 데이터라 요약/리포트 포함(원문 청크는 미반환).

## 모델/제공자
- 검색 임베딩 = OpenAI text-embedding-3-small (Day12).
- 요약/평가 = **Claude `claude-haiku-4-5`**(빠르고 저렴, 6회 호출 루프에 적합). 핸드북의 gpt-4o-mini 대신 프로젝트 일관성상 Claude 채택.

## 호출
```bash
curl -X POST https://ttt2-theta.vercel.app/api/workflow \
  -H "content-type: application/json" --cookie "<인증쿠키>" \
  -d '{"query":"태스크 우선순위는 무엇을 근거로 정하나요?"}'
```
응답: `{ runId, steps: StepResult[], summary, report }`.
