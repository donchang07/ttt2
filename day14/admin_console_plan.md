# 관리자 콘솔 설계 (Day14 산출물)

작성일: 2026-06-28 · 페이지 `/admin`(서버 컴포넌트, 관리자 전용). 운영자가 ~5분 내 서비스 상태 파악.

## 3개 섹션

### 1. 핵심 지표 (Key Metrics)
| 지표 | 정의 | 점검 주기 | 조치 기준 |
|---|---|---|---|
| 전체 팀 | `teams` 총 개수(관리자 RLS로 전체) | 일 1회 | 성장 추세 모니터 |
| 오늘 신규 팀 | `teams.created_at >= 오늘 0시` | 일 1회 | 0이 며칠 지속 시 유입 점검 |
| 오류(24h) | `activity_logs` event_type `error*` 24h 카운트 | 수시 | 급증 시 즉시 원인 조사 |

### 2. 최근 활동 (Recent Activity)
- 최근 24시간 `activity_logs`를 event_type별 집계(task.created, task.assigned 등).
- 점검 주기: 수시. 조치: 비정상 패턴(특정 이벤트 급감/급증) 발견 시 기능 점검.

### 3. 오류 로그 (Error Logs)
- 최근 24시간 `event_type LIKE 'error%'` 집계(코드별 건수).
- 점검 주기: 수시. 조치 기준: 동일 오류코드 다발 → 해당 플로우 긴급 수정(예: `error.task_assign` → 배정 경로 점검).

## 접근 제어(이중 방어)
- **페이지**: 미인증 → `/login`, 비관리자 → `/tasks`(서버에서 `profiles.role` 검증).
- **데이터**: RLS — 일반 사용자는 `activity_logs` SELECT 0행, 관리자만 전체(`security.is_admin()`).

## 로깅 원칙
- `logEvent()`는 **ID·이벤트 타입만** 기록. 이름·이메일·태스크 원문 금지.
- 통합 지점: 태스크 생성(`task.created`), 배정(`task.assigned`), 배정 실패(`error.task_assign`).
