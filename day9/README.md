# Day 9 — MCP

읽기 전용 MCP 서버(`list_recent_tasks`)로 외부 데이터(더미 demo_tasks)를 도구로 노출·호출하는 흐름을 체험.

## 산출물
| 항목 | 위치 |
|---|---|
| MCP 후보 결정(6칸) | [mcp_candidate_decision.md](./mcp_candidate_decision.md) |
| MCP 서버 템플릿 | `C:\Users\donch\ttt2\mcp` (강사 제공, taskflow 레포 밖) |
| 호출 결과 | 아래 표 |

## 빌드 (실행 결과)
| 명령 | 결과 |
|---|---|
| `node --version` | v22.14.0 |
| `npm install` (ttt2/mcp) | 완료, 취약점 0 (@modelcontextprotocol/sdk, zod) |
| `npm run build` | tsc 통과 |
| `ls dist/index.js` | 존재 (2,648 bytes) |

## 도구
- 서버: `taskflow-demo` (stdio MCP)
- 도구: **`list_recent_tasks`** — `limit`(1~20, 기본 3) 옵션, 최근 수정순 더미 태스크 반환. **읽기 전용**(insert/update/delete 없음).

## 호출 결과 (limit: 5)
demo_tasks · 연습용 더미:
| # | 상태 | 우선순위 | 제목 | 수정일 |
|---|------|---------|------|--------|
| 5 | doing | medium | 우선순위 추천 프롬프트 실험 | 2026-06-23 |
| 2 | todo | high | tasks 테이블 RLS 정책 | 2026-06-22 |
| 1 | doing | high | 로그인 화면 초안 | 2026-06-20 |
| 3 | done | medium | 랜딩 페이지 메타데이터 | 2026-06-19 |
| 4 | todo | low | 팀 초대 이메일 템플릿 | 2026-06-18 |

## 호출 방법
이 세션엔 서버가 Claude Code MCP(`my-mcp`)로 등록돼 있지 않아, 빌드된 `dist/index.js`를 **stdio MCP 클라이언트**(SDK `Client` + `StdioClientTransport`)로 직접 구동해 `tools/list` → `tools/call`로 호출함. 정식 등록 시 `.mcp.json`에 stdio 서버로 추가하면 다음 세션부터 MCP 도구로 바로 사용 가능.

## Day10 연결
Slice 2에서 이 목록을 읽어 **우선순위 추천 초안** 생성 입력으로 사용(읽기 전용).
