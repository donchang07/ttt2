# Day 08 Skill 후보 (A-07-O3)

작성일: 2026-06-27 · Slice 1 구현 중 반복된 작업 정리

| # | 반복 작업 | 빈도 | 자동화(Skill) 아이디어 | 입력 → 출력 |
|---|---|---|---|---|
| 1 | feature 슬라이스 뼈대 생성(actions/queries/form/page) | 매 기능 | `new-slice <도메인>` 스킬: 4파일 + 라우트 생성 | 도메인명 → 표준 파일 세트 |
| 2 | Supabase 서버/클라이언트 호출 + 인증 가드 보일러플레이트 | 매 액션 | `with-auth-action` 템플릿: getUser()+검증+revalidate | 액션명·검증규칙 → 액션 스텁 |
| 3 | RLS 정책 + 마이그레이션 작성/적용/어드바이저 점검 | 매 테이블 | `rls-table` 스킬: enable+정책+helper+advisor | 테이블·기준컬럼 → 마이그레이션 |
| 4 | 슬라이스 검증(typecheck/lint/build + A/B RLS) | 매 슬라이스 | `verify-slice` 스킬: 3검증 + 격리 테스트 스크립트 | 라우트 → 검증 리포트 |

> Day 08에서는 위 중 빈도·반복도가 높은 **#1(new-slice)**, **#2(with-auth-action)** 를 우선 스킬화 후보로 삼는다.
