# 2주차 점검표 (Day 06~10)

작성일: 2026-06-27 · 근거: 각 day 폴더 산출물·실제 검증 결과. 추측 없이 확인된 상태만 기록.
상태: 동작 / 부분 / 미완

| 산출물 | 현재 상태 | 증거 한 줄 | 남은 문제 / Day11 테스트 후보 |
|---|---|---|---|
| **Day06** layout metadata·sitemap·robots·JSON-LD | 동작 | `sitemap.xml`·`robots.txt` 200, `<head>`에 canonical·og:image 출력 | OG 이미지 자산(`/opengraph-image.png`) 미생성, 커스텀 도메인 미연결 |
| Day06 GEO_전략·metadata_plan·sitemap_plan·공개안전점검표 | 동작(문서) | day6/ 4개 문서 존재 | 거래형("가격") 키워드 ↔ Non-Scope(결제) 충돌은 PRD 재검토 후보 |
| **Day07** 인증(로그인/로그아웃·미들웨어) | 동작 | `/tasks` 미인증 시 307→/login, 데모 계정 로그인 후 /tasks 진입(스크린샷) | 회원가입 제외(로그인 전용), 사용자 시드/관리 경로 |
| Day07 태스크 생성·목록 Slice | 동작 | 로그인→생성→목록 표시(스크린샷), `pnpm typecheck/lint/build` 통과 | — |
| Day07 CLAUDE.md 정식판·점검카드·slice1_plan·karpathy_eval | 동작(문서) | day7/ 문서 존재 | slice1_plan은 스킬 데모로 팀 기반 초안(실제는 per-user) |
| **Day08** slice-plan-writer 스킬 | 동작 | `.claude/skills/slice-plan-writer/SKILL.md`+examples, 데모로 slice1_plan 생성 | 프로젝트-로컬 스킬(미등록 MCP 아님), 다른 입력 검증은 추가 가능 |
| **Day09** MCP 서버 빌드·호출 | 동작 | `dist/index.js` 빌드, `list_recent_tasks` limit=5 → 5건 반환 | `my-mcp` Claude Code 정식 등록 미완(stdio 직접 호출로 검증) |
| Day09 mcp_candidate_decision·mcp_test_log | 동작(문서) | day9/ 문서 존재 | — |
| **Day10** slice2_implementation_note(##1 선택·##2 오류가이드) | 동작(문서) | 후보 3·채점·추천 A + 오류 7유형 표 | — |
| Day10 assignTask Server Action | 동작 | typecheck 통과, UPDATE 정책 적용, REST로 assignee 변경 성공 | 정상/오류 흐름을 **Day11 테스트 입력**으로(아래) |
| Day10 AssignForm UI | 동작 | /tasks에 select+배정 버튼·담당 상태 표시(스크린샷) | 배정 대상은 본인만(팀원 목록은 Day11) |
| Day10 slice2_verification | **미완** | 골격만 작성, 케이스 실제 결과 **미입력(미실행)** | 케이스별 실제 실행·결과 기록 필요 |
| (BL-007) AI 우선순위 추천 | 미완 | 미구현 | Claude API 키 미발급 → Day10/13 보류 |

## Day11에서 테스트할 입력 후보 (정상/오류 흐름)
assignTask·상태 변경 기준 — 오늘은 흐름만 정의, 실제 실행은 Day11:
- 정상: 본인 태스크에 "나(본인)" 배정 → "담당: 나" 반영
- AUTH-401: 로그아웃 상태 배정 시도
- TASK-404: 없는 taskId / 타인 태스크(RLS 0행, 거짓 성공 방지)
- RULE-409: status='done' 태스크 배정
- TASK-ASSIGN-500: DB 오류 유도(서버 로그에 dbError)
- **역할 권한(leader만 배정·team_id 격리)**: Day11 범위 — 오늘 미실행
