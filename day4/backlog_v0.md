# 백로그 v0 — INVEST 10개 (A-04-O4)

작성일: 2026-06-27 · 입력: PRD Must(① 팀 생성·멤버 초대 ② 태스크 CRUD ③ 역할 기반 접근 ④ Auth+RLS)
형식: 제목 = "사용자는 [동작]을 [목적]을 위해 할 수 있다"

| BL-ID | 제목 | 완료 기준(테스트 가능) | 우선순위 | 관련 테이블 | 관련 RLS 정책 | 선행 조건 |
|---|---|---|---|---|---|---|
| BL-001 | 사용자는 이메일 로그인을 내 작업 공간 접근을 위해 할 수 있다 | 로그인 후 세션 유지·`auth.uid()` 존재 | Must | auth.users | — | Supabase Auth 설정 |
| BL-002 | 사용자는 팀을 만들기를 협업 공간 확보를 위해 할 수 있다 | 팀 생성 시 owner가 leader 멤버로 등록됨 | Must | teams, members | teams insert(owner), members | BL-001 |
| BL-003 | 사용자(leader)는 멤버를 초대하기를 팀 구성을 위해 할 수 있다 | leader가 추가한 멤버가 members에 role과 함께 생김 | Must | members | members(leader insert) | BL-002 |
| BL-004 | 사용자는 자기 팀 데이터만 보기를 정보 격리를 위해 할 수 있다 | 타 팀 계정에서 내 데이터 0건 조회 | Must | 전 테이블 | *_select(team_id) | BL-002 |
| BL-005 | 사용자는 태스크를 만들기를 할 일 기록을 위해 할 수 있다 | 생성 즉시 목록에 표시, created_by=나 | Must | tasks | tasks insert | BL-002 |
| BL-006 | 사용자는 태스크 목록을 보기를 진행 상황 파악을 위해 할 수 있다 | deleted_at NULL인 내 팀 태스크만 표시 | Must | tasks | tasks select | BL-005 |
| BL-007 | 사용자는 태스크 상태를 바꾸기를 진행 갱신을 위해 할 수 있다 | status 변경 시 updated_at 자동 갱신 | Must | tasks | tasks update | BL-005 |
| BL-008 | 사용자는 태스크를 soft delete 하기를 실수 복구 여지를 위해 할 수 있다 | deleted_at 설정 후 목록에서 사라짐 | Should | tasks | tasks update/delete | BL-005 |
| BL-009 | 사용자는 태스크에 담당자를 지정하기를 책임 명확화를 위해 할 수 있다 | assignee_id 설정·표시 | Should | tasks | tasks update | BL-005 |
| BL-010 | leader는 멤버 역할을 바꾸기를 권한 관리를 위해 할 수 있다 | role 변경 시 권한 경계 즉시 반영 | Could | members | members update(leader) | BL-003 |

> 1주 이상 항목 없음(모두 1~2일 슬라이스로 독립). BL-004(RLS 격리)는 보안 검증 게이트로 우선.
