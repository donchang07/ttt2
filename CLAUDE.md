# CLAUDE.md — TaskFlow (정식판)

## 1. 목적
TaskFlow = 팀의 할 일과 우선순위를 모으고, AI가 우선순위 + 근거를 제시해 5~15인 팀이 빠르게 합의하게 하는 SaaS. 이 문서는 AI 협업의 단일 기준이다.

## 2. 현황
- Next.js 15.5.19(App Router, Turbopack) · TypeScript strict · pnpm 11 · Tailwind v4 · Supabase
- DB 적용됨: `teams·members·tasks·notes` + RLS(team_id 기준). 배포: Vercel(https://ttt2-theta.vercel.app)
- 완료 슬라이스: 인증(이메일 로그인) + 태스크 등록/목록(Day 07)

## 3. 폴더 구조
- `src/app` — 라우팅 전용. 라우트 그룹 `(auth)`(로그인), `(dashboard)`(보호 영역)
- `src/features/<도메인>` — `components/`·`actions.ts`(서버 액션)·`queries.ts`·`types.ts`
- `src/lib/supabase` — `client.ts`(브라우저)·`server.ts`(서버)·`middleware.ts`(세션). publishable 키만
- `src/lib/ai` — 🔒 server-only(Claude 키). 클라이언트 import 금지
- `src/components`·`src/types`·`supabase/migrations`

## 4. 코딩 규칙
- 서버 컴포넌트 우선, `'use client'`는 상태·이벤트 필요 시만. 데이터 패칭에 `useEffect` 금지
- `any` 금지(`unknown`+좁히기). 서버 액션은 `'use server'`, 입력 검증 필수
- 변경은 요청 범위만(surgical). 의존성은 package.json 명시 후 설치, lockfile 수기 편집 금지

## 5. 보안
- 키 분리: `NEXT_PUBLIC_*`(publishable)만 클라이언트. `SUPABASE_SECRET_KEY`·Claude 키는 서버 전용, `NEXT_PUBLIC_` 금지
- 모든 테이블 RLS(team_id 격리, Default Deny). `created_by`는 서버에서 `user.id`로 강제
- service_role/secret 키를 브라우저·GitHub·캡처에 노출 금지. `.env.local`은 gitignore

## 6. 도메인 컨텍스트
- 핵심 용어: `team` · `member`(role: leader/member) · `task`(status, priority, ai_reason) · `note`
- 데이터는 **team 단위 격리**. 사용자는 `members`로 팀에 속하고, 자기 팀 데이터만 접근
- 측정 이벤트: `priority_decided`, `ai_recommendation_shown/accepted`, `first_task_created`

## 7. 검증
- 완료 기준: `pnpm typecheck` · `pnpm lint` · `pnpm build` 모두 통과
- 슬라이스는 RLS A/B 격리(타 계정 0건) 확인까지

## 8. 결정 로그 (Decision Log)
- 2026-06-27: BaaS=Supabase, 데이터 접근 서버 우선(@supabase/ssr), LLM 호출 서버 전용(ADR-1~3, [TRD](day5/TRD_v1.md))
- 2026-06-27: RLS 재귀 방지 위해 `members` 자기참조 대신 SECURITY DEFINER 헬퍼(`user_team_ids`, `is_team_leader`) 사용
- 2026-06-27: 팀 기반 스키마라 첫 태스크 시 `ensure_personal_team()`으로 팀 자동 보장
