# Day 13 — 에이전트 워크플로 (다단계 + 자기개선 루프)

핸드북 Day13을 TaskFlow에 구현. 검색 → 요약(자기개선 루프) → 리포트 → (선택)알림을 순차 실행하는 워크플로 엔진. 요약/평가는 **Claude `claude-haiku-4-5`**(핸드북 gpt-4o-mini 대신 프로젝트 일관성), 검색 임베딩은 Day12 OpenAI 그대로.

## 산출물
| 항목 | 위치 |
|---|---|
| 워크플로 다이어그램(Mermaid) | [workflow_diagram.md](./workflow_diagram.md) |
| 구현 노트 | [workflow_implementation_note.md](./workflow_implementation_note.md) |
| 자기개선 루프 노트 | [improvement_loop_note.md](./improvement_loop_note.md) |
| 실행 로그(실측) | [workflow_run_log.md](./workflow_run_log.md) |
| Day14 콘솔 입력(8필드) | [day14_console_input.md](./day14_console_input.md) |

## 코드
- `src/lib/workflow/engine.ts` — `runWorkflow`(순차·`Promise.race` 타임아웃), `StepResult`, 필수 실패 시 중단/선택 실패 시 계속
- `src/lib/workflow/steps.ts` — search(8s)·summarize(15s, generate→evaluate 루프)·report(8s)·notify(5s, 선택)
- `src/lib/workflow/securityGate.ts` — email·전화·API 키·Slack 웹훅 마스킹/차단
- `src/app/api/workflow/route.ts` — `POST {query}` → 인증 → 실행 → `{runId, steps, summary, report}`

## 자기개선 루프
generate→evaluate→재시도. **minScore 75 · 최대 3회 · LLM 호출 ≤ 6 · timeout 15s · 점수 충족 시 조기 종료**. 최고 점수 요약 반환.

## 실측(prod, runId a3126bd4)
4단계 전부 ok, 총 4215ms. 요약 점수 85로 1회 반복 후 조기 종료. 근거 기반 요약([1][2] 인용) 생성. 상세 [workflow_run_log.md](./workflow_run_log.md).

## 테스트
```bash
curl -X POST https://ttt2-theta.vercel.app/api/workflow \
  -H "content-type: application/json" --cookie "<인증쿠키>" \
  -d '{"query":"태스크 우선순위는 무엇을 근거로 정하나요?"}'
```

## 비고
- `notify`는 `SLACK_WEBHOOK_URL` 미설정 시 자동 생략(선택 단계).
- `report`는 로컬에서만 `reports/`에 저장(gitignore), 서버리스는 응답으로만 반환.
