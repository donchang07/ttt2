# 계정 A/B 격리 검증 (Day11 산출물 A-11-O2)

작성일: 2026-06-28 · 대상 테이블: `public.tasks`(per-user, created_by 격리)
검증 방식: Supabase에서 `request.jwt.claims`로 각 계정을 가장한 RLS 시뮬레이션(롤백, 실데이터 무변경) + 미들웨어 HTTP 동작. 실제 수행한 것만 기록.

- 계정 A(소유자): `donchang0725@gmail.com` — tasks 5건 보유
- 계정 B(타인): `demo@taskflow.test` — tasks 0건 보유

## 4가지 경계 테스트

| # | 테스트 | 기대 결과 | 실제 결과 | 증거 |
|---|---|---|---|---|
| 1 | 미인증 상태 `/tasks`(보호 라우트) 접근 | `/login`으로 redirect | **차단(307→/login)** | 미들웨어 `getUser()` 후 미인증 307 redirect (직전 세션 확인) |
| 2 | 계정 B가 계정 A 데이터 조회 | 0건(빈 목록) | **0건** | RLS 시뮬레이션: `sub=B`로 `select count(*) from tasks` → 0 (A는 동일 쿼리 5) |
| 3 | 계정 B가 created_by=A로 INSERT(소유자 위조) | WITH CHECK 거부 | **거부(행 0)** | `sub=B`로 `insert ... created_by=A` → 예외 발생, `title='forged'` 잔존 0건 |
| 4 | 로그아웃 후 보호 라우트 새로고침 | 접근 차단, `/login` | **차단(307→/login)** | #1과 동일 미들웨어 경로(세션 없음 → redirect) |

## 추가 확인
- 소유자 A 동일 쿼리 → 5건 정상 노출(정책이 본인 데이터는 허용).
- DELETE/UPDATE도 `auth.uid() = created_by`라 B는 A의 행에 0행 영향(SELECT 0건과 동일 근거).
- **브라우저 실측(prod, 2026-06-28, 교수님)**: https://ttt2-theta.vercel.app/tasks 에서 로그인 → 보호 라우트 진입·목록 표시 정상 동작 확인(테스트 #1/#4 미들웨어 흐름을 실제 브라우저로 재확인).

## 비고 (격리 모델)
- `tasks`는 **per-user(소유자)** 격리다. "leader만 배정" 같은 역할 기반 제한은 tasks RLS에 없음 — 역할(leader/member) 격리는 `notes_delete`의 `is_team_leader()`와 `members`/`teams`의 team 기반 정책에 적용된다.
- 앱 액션(assignTask) 레벨의 정상/AUTH-401/TASK-404/RULE-409/500 흐름은 브라우저 실행이 필요해 `day10/slice2_verification.md`에서 별도 관리(미실행분 존재). 본 문서는 **DB RLS 격리**의 실측 증거다.

## 안전 점검(캡처/제출)
- `.env.local`·anon/service_role 키·JWT/refresh 토큰 미포함 ✓
- 더미 계정(demo*)만 사용, 실명·실이메일·실전화 없음 ✓ (소유자 계정 이메일은 교수 본인 계정으로, 제출 캡처 시 마스킹 권장)
