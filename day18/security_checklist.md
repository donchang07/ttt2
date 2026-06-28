# 보안 점검표 (Day18 산출물 A-18-O1)

작성일: 2026-06-28 · Track A(실제 코드·DB 실측). 예방·탐지·복구 중 **예방** 단계.

| # | 항목 | 확인 방법 | 결과 | 미통과 시 조치 |
|---|---|---|---|---|
| 1 | RLS 전체 활성화 | `pg_tables.rowsecurity`(Supabase) 7테이블 | ✅ 통과 | (해당 없음) |
| 2 | service_role/secret 키 노출 없음 | `grep service_role`·`SUPABASE_SECRET_KEY` src | ✅ 통과 | 키를 코드서 제거·서버 전용화 |
| 3 | NEXT_PUBLIC_ 최소화 | `.env.local` 내 변수명 | ✅ 통과(2종, publishable만) | 공개 불필요 키 prefix 제거 |
| 4 | .env git 미추적 | `git ls-files \| grep env` | ✅ 통과(0건) | `git rm --cached` + `.gitignore` |
| 5 | SQL Injection 방지 | Supabase `.eq()/.rpc()`, raw 문자열 조합 없음 | ✅ 통과 | 파라미터 바인딩(.eq)로 교체 |
| 6 | 입력 검증 | 서버액션·API route json/필드 검증·trim | ✅ 통과 | 서버측 검증 추가 |
| 7 | 관리자 경로 보호(/admin) | 서버 role 체크 + redirect(page) + adminGuard(actions) | ✅ 통과 | 서버 role 체크 추가 |
| 8 | 인증 확인 존재 | 모든 route/action `getUser()` 가드 | ✅ 통과 | getUser 가드 삽입 |
| 9 | 오류 로그 탐지 | `console.error` + `activity_logs` `error.*`(Day17) | ✅ 통과 | 로깅 추가 |
| 10 | 에러 메시지 노출 차단 | API catch: `console.error(e)` + generic 응답 | ✅ 통과 | error.message → generic 교체 |

## 결과 요약
- **10/10 통과, 미통과 0** — Day7~17 동안 RLS·서버 권한 재검증·generic 에러를 지켜와 잔여 취약점 없음.

## 비고(점검표 외 한계 — Day19 후보)
- **Rate Limiting 부재**: 전역 요청 제한 없음(test-alert만 토큰 보호). 남용 방지 필요 시 Vercel Firewall/미들웨어 rate limit 추가. → `day19_release_input.md` 후보.
- **CORS**: Next.js 기본 same-origin, 별도 개방 없음(통과).
