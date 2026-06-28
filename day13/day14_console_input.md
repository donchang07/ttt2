# Day14 관리자 콘솔 입력 (Day13 산출물)

Day14 어드민 콘솔이 워크플로 실행 1건당 표시할 **8개 구조화 필드**. 원문·PII·키 미포함(보안 게이트 통과 값만).

| # | 필드 | 타입 | 예 | 출처 |
|---|---|---|---|---|
| 1 | `runId` | string | `a1b2c3d4` | route(randomUUID 8자) |
| 2 | `query` | string | "태스크 우선순위는…" | 요청 본문 |
| 3 | `overallStatus` | enum(ok/partial/error) | ok | steps 종합(필수 실패=error, 선택만 실패=partial) |
| 4 | `totalDurationMs` | number | 4120 | steps durationMs 합 |
| 5 | `stepStats` | {ok,error,skipped} | {3,0,1} | steps 상태 집계 |
| 6 | `summaryScore` | number(0-100) | 88 | summarize output.score |
| 7 | `iterations` | number(1-3) | 1 | summarize output.iterations |
| 8 | `errorCodes` | string[] | [] | steps의 null 아닌 errorCode 모음 |

## 전달 규칙 (Day12 day13_workflow_input.md 경계 준수)
- **전달 가능**: 위 8필드, 요약 텍스트(마스킹됨), 단계별 outputSummary.
- **전달 금지**: 검색 원문 청크(content), 사용자 PII, API 키, Slack 웹훅 URL, 실 user_id.
- 콘솔은 **인증 관리자**에게만 노출, 외부 전송은 보안 게이트 경유.

## Day14 연결
관리자 콘솔에서 이 8필드로 실행 이력 테이블·필터(상태/점수/오류코드)를 구성. 실패(`overallStatus=error`)·저품질(`summaryScore<75`) 건을 강조.
