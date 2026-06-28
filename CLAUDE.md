# CLAUDE.md — TaskFlow (정식판)

## 1. Project Purpose
TaskFlow는 **5~15인 팀의 PM/팀장**이 슬랙·메모·회의로 흩어진 할 일에서 "오늘 뭐부터?"를 **30초 안에 근거 있게** 정하도록, **AI가 우선순위와 근거 문장을 제안**하는 태스크 관리 SaaS다. 차별점은 "정렬"이 아니라 "근거 있는 추천".

## 2. Current State
- ✅ **완료**: Supabase 이메일 인증(로그인/로그아웃/getUser, 미들웨어 세션), `teams·members·tasks·notes` 테이블 + RLS 적용, 태스크 생성·목록 Slice(Day07), SEO 기본(metadata·sitemap·robots·JSON-LD, Day06)
- 🚧 **진행 중**: AI 우선순위 추천(priority·ai_reason 채우기), 관리자 콘솔
- ⬜ **미시작**: 결제·구독, 노트(RAG), 알림(Slack), 모바일/다국어
- 배포: Vercel 자동배포(현재 `https://ttt2-theta.vercel.app`)

## 3. Project Structure
(Day05 A-05-O3 기준)
- `src/app` — 라우팅 전용. 그룹 `(auth)`(로그인), `(dashboard)`(보호 라우트, URL엔 미반영 → 실제 `/tasks`)
- `src/features/<도메인>` — `components/`·`actions.ts`(서버 액션)·`queries.ts`·`types.ts` (예: `src/features/tasks`, `src/features/auth`)
- `src/lib/supabase` — `client.ts`(브라우저)·`server.ts`(서버)·`middleware.ts`(세션). publishable 키만
- `src/lib/ai` — 🔒 server-only(Claude 키). 클라이언트 import 금지 (예정)
- `src/components`·`src/types`·`supabase/migrations`

## 4. Coding Rules
- Next.js 15 App Router · TypeScript strict · pnpm · Tailwind v4
- 서버 컴포넌트 우선, `'use client'`는 상태·이벤트 필요 시만. 데이터 패칭에 `useEffect` 금지
- `any` 금지(`unknown`+좁히기). 서버 액션은 `'use server'` + 입력 검증
- 변경은 요청 범위만(surgical), 무관한 리팩터 금지. 의존성은 `package.json` 명시 후 설치(임의 설치 금지), lockfile 수기 편집 금지
- 공개 페이지는 metadata(title·description·canonical) 필수, 비공개/인증 페이지는 `robots: { index: false }` (Day06 A-06-O1)

## 5. Security Rules
- **`service_role`/secret 키를 브라우저 코드·제출물·캡처에 노출하지 않는다.** 서버 전용. 클라이언트엔 `NEXT_PUBLIC_` publishable 키만.
- **실제 고객 데이터·실제 전화번호를 실습에 사용하지 않는다.** 더미 데이터만.
- **hidden input·URL param의 ID를 신뢰하지 않고 서버에서 권한을 다시 확인한다.** 예: `created_by`는 서버에서 `auth.uid()`로 강제, 소속/역할은 RLS·서버에서 재검증.
- 모든 테이블 RLS(team_id 격리, Default Deny). 비밀 값을 `NEXT_PUBLIC_`에 넣지 않는다. `.env.local`은 gitignore(코드·문서에 실제 값 기록 금지).
- 공개 sitemap엔 공개 페이지만. robots.txt는 보안 장치가 아니다 — 비공개는 Auth·RLS·rate limit으로 보호.

## 6. Domain Context
- 핵심 용어: `team` · `member`(role: leader/member) · `task`(status, priority, ai_reason) · `note`
- 데이터는 **team 단위 격리**. 사용자는 `members`로 팀에 속하고 자기 팀 데이터만 접근. 팀이 없으면 첫 태스크 시 `ensure_personal_team()`으로 자동 생성
- 측정 이벤트: `priority_decided`, `ai_recommendation_shown/accepted`, `first_task_created`

## 7. Verification Commands
```
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm build       # next build
```
완료 기준: 위 3개 통과 + 보안 슬라이스는 **계정 A/B RLS 격리(타 팀 0건)** 확인. (pnpm dev 실행 중엔 같은 폴더에서 build 금지 — .next 충돌)

## 8. Decision Log
- 2026-06-27: BaaS=Supabase, 데이터 접근 서버 우선(@supabase/ssr), LLM 호출 서버 전용 Route Handler(ADR-1~3, [TRD](day5/TRD_v1.md))
- 2026-06-27: RLS 재귀 방지 위해 `members` 자기참조 대신 SECURITY DEFINER 헬퍼(`user_team_ids`, `is_team_leader`)
- 2026-06-27: 팀 기반 스키마라 첫 태스크 시 `ensure_personal_team()`으로 팀 자동 보장
- 2026-06-27: 인증은 **로그인 전용**(회원가입·비밀번호 재설정 제외), 사용자는 시드/관리자 경로로 생성
- 2026-06-28: 위 결정 일부 변경 — **이메일+비밀번호 회원가입 재도입**(실습용 셀프 가입). 로그인 폼에 가입 토글 추가. profiles는 `handle_new_user` 트리거로 자동 생성(스키마 변경 없음). **Confirm email = OFF**(가입 즉시 세션→/tasks). 확인메일 콜백(`/auth/callback`)은 불필요해 제거(Trash Can 보관)
- 2026-06-27: 공개 도메인은 Vercel 기본 URL 유지(taskflow.app 미소유). 커스텀 도메인 확보 시 base URL만 교체
