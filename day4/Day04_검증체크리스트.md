# Day 04 검증 체크리스트 — 누락 0 점검

작성일: 2026-06-27 · 핸드북 Day04 요구사항 ↔ 산출물 매핑

## 필수 산출물 (5종 + Day3 이월)
| ID | 산출물 | 파일 | 상태 |
|---|---|---|---|
| A-03-O1(이월) | PRD ## 7 전달표 보완(엔티티+RLS 기준+MoSCoW) | [../day3/PRD_v1.md](../day3/PRD_v1.md) | ✅ 표로 정제 |
| A-04-O1 | ERD (3+테이블·관계·RLS 기준·삭제정책) | [ERD.md](./ERD.md) | ✅ 4테이블 |
| A-04-O1 | CREATE TABLE SQL(실행순서·트리거) | [schema_draft.sql](./schema_draft.sql) | ✅ |
| A-04-O2 | RLS(권한표+CREATE POLICY+A/B 계획) | [rls_policy_draft.md](./rls_policy_draft.md) | ✅ |
| A-04-O3 | 자동화 후보 3개(trigger/Edge/Cron) | [automation_candidates.md](./automation_candidates.md) | ✅ |
| A-04-O4 | INVEST 백로그 10개 | [backlog_v0.md](./backlog_v0.md) | ✅ 10개 |

## 핸드북 세부 요건 점검
| 요건 | 결과 |
|---|---|
| 모든 테이블 id(UUID PK)·created_at | ✅ teams·members·tasks·notes |
| FK → auth.users(id) (user_id·created_by) | ✅ |
| RLS 기준 컬럼 ★ 명시 | ✅ team_id (members·tasks·notes) |
| soft delete(deleted_at) | ✅ tasks |
| updated_at 자동 갱신 트리거 함수 | ✅ set_updated_at + trigger |
| 실행 순서(teams→members→tasks→notes→트리거) | ✅ |
| RLS USING/WITH CHECK 구분 설명 | ✅ |
| 계정 A/B 검증 케이스 3개 | ✅ (rls_policy_draft) |
| 자동화 후보 3유형(DB/Edge/Cron) | ✅ |
| 엔티티-컬럼-관계-민감도-삭제방식 표 | ✅ (ERD) |

## 보안 점검
| 항목 | 결과 |
|---|---|
| service_role·secret 키 문서 미포함 | ✅ |
| .env.local 내용 미기록 | ✅ |
| 실명·이메일·계약정보 없음(더미만) | ✅ |

## 실제 적용·검증 (Day07 연계)
- 마이그레이션 4종 적용(`supabase/migrations/...01~04`), 전 테이블 RLS ON.
- 보안 어드바이저: search_path·anon 실행 경고 해소.
- **A/B 격리 실측**: 사용자 B가 A의 태스크 0건 (Day07 검증).
- 헬퍼 함수: `user_team_ids`·`is_team_leader`·`ensure_personal_team` (재귀 방지·팀 보장).

## 결론
Day 04 필수 산출물 6개(이월 포함) + 세부 요건 + 보안 점검 **모두 충족, 누락 없음.** 설계가 실제 DB에 적용·검증까지 완료됨.
