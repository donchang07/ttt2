# Slice 1 검증 (A-07 검증) — 2026-06-27

## 빌드/정적 검증
| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ 통과 |
| `pnpm lint` | ✅ 통과 (Trash Can 백업 폴더 ignore 추가 후) |
| `pnpm build` | ✅ 통과 — `/login`(static), `/tasks`(dynamic), Middleware 적용 |

## 동작 검증 (실서버 Supabase + REST E2E)
| 케이스 | 기대 | 결과 |
|---|---|---|
| 미인증 `/tasks` 접근 | `/login` 리다이렉트 | ✅ HTTP 307 |
| `/login` 렌더 | 로그인 화면 | ✅ HTTP 200 |
| 로그인(A) | access_token 발급 | ✅ |
| 팀 보장 | ensure_personal_team → team_id | ✅ |
| 태스크 생성(A) | INSERT 성공(created_by=A) | ✅ |
| 목록 조회(A) | 내 태스크 1건 | ✅ count=1 |
| **RLS 격리(B)** | B는 A의 태스크 **0건** | ✅ count=0 |
| 빈/짧은 제목 | "2~80자" 오류 | ✅ 서버 검증 |

## 보안 점검
- ✅ `created_by`는 서버에서 `user.id`로 강제 (폼 입력 신뢰 안 함)
- ✅ RLS 판단을 SQL Editor가 아닌 **앱/사용자 토큰 기준**으로 확인 (B 계정 0건)
- ✅ 클라이언트는 publishable 키만 사용, service_role/secret 미사용
- ✅ 미들웨어로 세션 쿠키 갱신

## 비고 (NEEDS-YOU)
- 이메일 자동확인이 OFF라, 실제 가입은 메일 인증이 필요. 검증용 **데모 계정**을 DB에 시드함:
  - `demo@taskflow.test` / `demo2@taskflow.test` (비밀번호 `TaskFlow1234!`) — dev 전용, 필요시 교수님이 정리.
- 브라우저에서 직접 확인: localhost:3000/login → 데모 계정 로그인 → /tasks에서 추가/목록 확인.
