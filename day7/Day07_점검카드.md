# Day 07 점검 카드 (A-07-R1)

작성일: 2026-06-27 · 7항목 확정

| # | 항목 | 확정 내용 |
|---|---|---|
| 1 | Slice 1 행동 | 로그인 사용자가 태스크를 등록하면 내 팀 목록에 보인다 |
| 2 | 테이블 | `public.tasks` (이미 적용됨) |
| 3 | 컬럼 | title·status·priority·created_by·team_id·deleted_at·timestamps |
| 4 | RLS | team_id 기준(`user_team_ids()`), INSERT는 created_by=auth.uid() |
| 5 | 인증 | Supabase 이메일 로그인 + 미들웨어 세션 갱신 + getUser() |
| 6 | 환경 | publishable 키만 클라이언트, secret/service_role 미사용 |
| 7 | 팀 보장 | `ensure_personal_team()` SECURITY DEFINER로 첫 태스크 시 팀 자동 생성 |
