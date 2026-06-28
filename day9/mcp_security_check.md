# MCP 보안 점검표 (A-09-O3)

작성일: 2026-06-28 (Day09 산출물 사후 보완) · 대상: `taskflow-demo` MCP 서버(`list_recent_tasks`), 위치 `C:\Users\donch\ttt2\mcp`(레포 밖, 강사 제공 템플릿)

| # | 점검 항목 | 결과 | 근거 |
|---|---|---|---|
| 1 | `.env` git 미추적 | 통과 | MCP 서버는 `.env` 불사용(더미 demo_tasks 하드코딩), taskflow 레포 `.env.local`도 gitignore |
| 2 | 키 노출 없음 | 통과 | 캡처·로그·코드에 API 키/secret 미포함. 도구 출력은 더미 태스크 5건뿐 |
| 3 | 더미 데이터만 사용 | 통과 | demo_tasks(로그인 화면 초안·RLS 정책 등 연습용)만, 실고객·실전화번호 없음 |
| 4 | 허용 경로만 접근 | 통과 | 서버는 파일시스템·네트워크 미접근, 메모리 내 더미 배열만 반환 |
| 5 | 쓰기 실행 없음 | 통과 | `list_recent_tasks`는 읽기 전용 — insert/update/delete 도구 미정의 |
| 6 | 권한 범위 최소 | 통과 | `limit`(1~20) 단일 옵션, stdio 로컬 구동, 외부 시스템 자격 미요구 |

## service_role 키 위험 별도 기록
- MCP 서버가 DB에 직접 붙을 때 **service_role 키를 쓰면 RLS를 전면 우회**한다 → 도구 하나가 전 팀 데이터를 읽고 쓸 수 있어 멀티테넌트 격리가 무력화된다.
- 원칙: MCP 도구는 (a) 읽기 전용부터, (b) publishable/anon 키 또는 사용자 토큰 기반 RLS 경유, (c) service_role이 불가피하면 서버 측에서 team_id 스코프를 강제하고 절대 클라이언트·도구 응답에 키를 싣지 않는다.
- 현재 `taskflow-demo`는 DB 미연결(더미)이라 해당 위험 없음. 실DB 연동 시 위 원칙 적용.
