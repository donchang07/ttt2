# Day 14 — 관리자 콘솔 (RBAC)

핸드북 Day14를 TaskFlow에 구현. `/admin` 서버 렌더 대시보드 3섹션(핵심 지표·최근 활동·오류 로그) + 역할 기반 접근(RBAC) 이중 방어 + 활동 로깅.

## 산출물
| 항목 | 위치 |
|---|---|
| 콘솔 설계(3섹션) | [admin_console_plan.md](./admin_console_plan.md) |
| 스키마 SQL(실적용) | [activity_log_schema.sql](./activity_log_schema.sql) |
| 접근 제어 검증(4종 실측) | [admin_access_check.md](./admin_access_check.md) |
| 운영 알림(선택) | [operation_alert_check.md](./operation_alert_check.md) |
| Day15 PDCA 입력 | [day15_pdca_input.md](./day15_pdca_input.md) |

## DB (마이그레이션 day14_admin_console)
- `profiles.role`('user'|'admin', 기본 'user') — members.role(팀역할)과 별개
- `security.is_admin()` SECURITY DEFINER (REST 미노출, RLS 내부 전용)
- `activity_logs(id, user_id, event_type, event_data, created_at)` + RLS(INSERT own / SELECT admin) + 인덱스 2
- `teams_select`에 admin override(메트릭용 전체 조회)

## 코드
- `src/app/admin/page.tsx` — 서버 컴포넌트, 미인증→/login·비관리자→/tasks, 3섹션 집계(Promise.all)
- `src/lib/admin/log.ts` — `logEvent()` (ID·이벤트만, PII 금지)
- `src/features/tasks/actions.ts` — 연동: `task.created`·`task.assigned`·`error.task_assign`

## RBAC 실측(prod)
| 테스트 | 결과 |
|---|---|
| 미인증 → /admin | 307 → /login ✓ |
| 관리자 → /admin | 200 ✓ |
| 일반 → /admin | 307 → /tasks ✓ |
| 일반 activity_logs SELECT | 0건(RLS 차단) ✓ |

페이지·데이터 **이중 방어** 동시 동작 확인. 상세 [admin_access_check.md](./admin_access_check.md).

## 비고
- 더미 관리자: rag-eval-a(role=admin). 알림(Slack)은 웹훅 미설정으로 설계만.
