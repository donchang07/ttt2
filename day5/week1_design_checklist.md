# Week 1 설계 제출 점검표 (A-05-O5)

작성일: 2026-06-27 · 대상: Day03~05 산출물

## 누락 점검
| 항목 | 상태 | 비고 |
|---|---|---|
| 제품 설명(한 줄·문제·가치) | ✅ | PRD ## 1 |
| PRD 7섹션 완성 | ✅ | [PRD_v1](../day3/PRD_v1.md) |
| 백로그 유형 균형(기능/보안/배포/측정) | ✅ | 20개, Must 8·Security 4·Deploy 2·Measure 2·Quality 3·Operate 1 |
| ERD + RLS 기준 컬럼(★) | ✅ | [ERD](../day4/ERD.md) team_id ★ |
| schema_draft.sql 실행순서·트리거 | ✅ | teams→members→tasks→notes→trigger |
| RLS USING/WITH CHECK 구분 | ✅ | [rls_policy_draft](../day4/rls_policy_draft.md) |
| A/B 검증 케이스 3개 | ✅ | rls_policy_draft |
| ADR-lite 3개(대안·리스크·재검토·확인일) | ✅ | [TRD_v1](./TRD_v1.md) |
| 1분 핵심가치 경로 | ✅ | [core_value_scenario](./core_value_scenario.md) |
| 폴더 구조 + key 경계 주석 | ✅ | [folder_structure_draft](./folder_structure_draft.md) |

## 보안 점검
| 항목 | 상태 |
|---|---|
| API key·service_role 키 문서 미포함 | ✅ |
| .env.local 내용 문서 미기록 | ✅ |
| 실명·이메일·전화·계약 정보 없음(더미만) | ✅ |
| RLS 기준 컬럼(team_id) 명시 | ✅ |

## ⚠️ 미해결(NEEDS-YOU)
- Claude API 모델·단가·응답시간: 키 발급(Day10) 후 TRD 확정 필요.
- Supabase secret 키 무효 → 재발급(Day11 전).
