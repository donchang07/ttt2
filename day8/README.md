# Day 8 — AI Skill

프로젝트-로컬 스킬 **slice-plan-writer**를 만들어, 슬라이스 계획서 작성을 자동화했다.

## 산출물
| 항목 | 위치 | 비고 |
|---|---|---|
| Skill 후보 정리 | [day08_skill_candidates.md](./day08_skill_candidates.md) | 오늘 반복 작업에서 도출한 4개 후보(이름/가치/입력/출력) |
| **Skill 본체** | `.claude/skills/slice-plan-writer/SKILL.md` | 동작하려면 `.claude/skills/`에 있어야 함(여기로 이동 불가) |
| Skill 예시 입력 | `.claude/skills/slice-plan-writer/examples/sample-input.md` | 더미 팀 기반 입력 |
| Skill 예시 출력 | `.claude/skills/slice-plan-writer/examples/sample-output.md` | SKILL.md Output 표 형식 |
| 스킬 생성 데모 | [../day7/slice1_plan.md](../day7/slice1_plan.md) | sample-input으로 스킬이 생성한 8칸 표 초안 |

## slice-plan-writer 요약
- **목적**: PRD Must·백로그 ID·대상 테이블·RLS 규칙을 입력받아, "사용자 행동 한 가지"로 좁힌 1페이지 슬라이스 계획서(8칸 표)를 생성.
- **입력**: PRD Must / Backlog ID / Target page / Target table / Auth·RLS / Verification.
- **출력**: `slice1_plan.md`의 8칸 표(Slice 이름·연결 PRD·백로그 ID·테이블·권한 기준·정상 흐름·오류 흐름·완료 증거).
- **안전 규칙**: 더미만 사용, 키·.env 금지, 구현 파일 임의 수정 금지, **입력이 빠지면 추측 말고 먼저 질문**.

## 사용법
이 레포에서 슬라이스 계획이 필요할 때 slice-plan-writer 스킬을 호출하고 6개 입력을 제공하면 `slice1_plan.md` 초안이 생성된다. (입력 누락 시 스킬이 먼저 무엇이 빠졌는지 묻는다.)
