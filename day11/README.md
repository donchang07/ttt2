# Day 11 — Supabase 인증 / RLS 구현

핸드북 Day11(인증·RLS)을 TaskFlow에 적용. 단, 인증·미들웨어·RLS·자동 프로필 트리거는 Day7/Day4/Day10에서 이미 구축돼 있어, **신규 구축이 아니라 실측 검증 + 핸드북 정합 하드닝**으로 진행했다.

## 산출물
| 항목 | 위치 | 핸드북 ID |
|---|---|---|
| RLS 정책 SQL(실측 재구성) | [rls_policy.sql](./rls_policy.sql) | A-11-O2 |
| 계정 A/B 격리 검증(실측) | [account_ab_test.md](./account_ab_test.md) | A-11-O2 |
| Day12 접근제어 준비 노트 | [day12_access_note.md](./day12_access_note.md) | A-11-O3 |

## 이미 충족(코드/DB 확인됨)
- **A-11-O1 인증·보호 라우트**: 로그인/로그아웃/미들웨어 `getUser()`/`/auth/callback`/보호 라우트 — Day7 구현. (프로젝트는 **로그인 전용**, 회원가입 제외 — 결정 로그)
- **5개 테이블 RLS on** + 헬퍼함수(`user_team_ids`·`is_team_leader`).
- **자동 프로필 생성**: `on_auth_user_created` 트리거 → `handle_new_user()`(SECURITY DEFINER) 존재.

## 오늘 적용한 하드닝(마이그레이션 `day11_rls_hardening` / `day11_revoke_handle_new_user_public`)
1. `tasks` **DELETE 정책** 추가(`auth.uid() = created_by`) — SELECT/INSERT/UPDATE/DELETE 4종 완비.
2. `profiles` **UPDATE own 정책** 추가(SELECT는 배정 디렉터리로 `true` 유지 — Day10 결정).
3. `handle_new_user` **RPC 노출 제거**(`revoke execute ... from public`) — 트리거 전용. advisor 0028/0029 경고 해소(anon/auth EXECUTE=false, 트리거 정상).

## RLS 격리 실측(시뮬레이션, 롤백)
| 테스트 | 결과 |
|---|---|
| 소유자 A `select count(*) from tasks` | 5건 ✓ |
| 타인 B 동일 쿼리 | 0건 ✓ 격리 |
| B가 created_by=A로 INSERT | WITH CHECK 거부(잔존 0) ✓ |
| 미인증 보호 라우트 | 307→/login ✓ |

## 남은 보안 항목(교수님 액션)
- **유출 비밀번호 보호 비활성** — Authentication > Attack Protection. **Free 플랜 제약으로 보류**(HaveIBeenPwned 연동은 Pro 플랜 이상 전용, 2026-06-28 확인). Pro 업그레이드 시 활성화.
- `ensure_personal_team`·`is_team_leader`·`user_team_ids`의 authenticated EXECUTE 경고는 **의도된 노출**(RLS 정책이 내부 호출 + 앱이 RPC 호출) — 유지.

## Day12 연결
노트/RAG의 문서·임베딩 테이블도 동일 RLS(team_id 기반)로 격리. 임베딩 키 발급이 블로커. 상세 [day12_access_note.md](./day12_access_note.md).
