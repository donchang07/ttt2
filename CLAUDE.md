# CLAUDE.md — TaskFlow

## 프로젝트 규칙
- Next.js 15 (App Router) · TypeScript strict · pnpm · Tailwind v4 · Supabase
- 서버 컴포넌트 우선. `'use client'`는 상태·이벤트·브라우저 API가 필요할 때만
- 데이터 패칭에 `useEffect` 금지 — 서버 컴포넌트 또는 서버 액션 사용

## 1) 폴더 구조
- `src/app` — 라우트(페이지·레이아웃·route handler)
- `src/components` — 재사용 UI 컴포넌트
- `src/lib` — 클라이언트 로직·유틸 (`src/lib/supabase/`에 client.ts·server.ts)
- `src/types` — 공용 타입 정의
- `supabase/migrations` — DB 마이그레이션(타임스탬프 접두사)

## 2) 코딩 규칙
- TypeScript strict, `any` 금지 (필요 시 `unknown` + 좁히기)
- 서버/클라이언트 경계 명확히 — 클라이언트 컴포넌트에서 서버 전용 모듈 import 금지
- 변경은 요청 범위 내에서만(surgical). 무관한 코드 리팩터 금지
- 의존성은 `package.json`에 명시 후 설치. lockfile 수기 편집 금지

## 3) 금지 사항
- `any` 타입
- `console.log` 등 디버그 출력 커밋
- secret·API 키 하드코딩
- 클라이언트 코드에서 `SUPABASE_SECRET_KEY` / service_role 키 사용
- `NEXT_PUBLIC_` 접두사에 비밀 값 넣기

## 4) 출력 형식 (작업 보고)
- 변경한 파일 목록
- 변경 이유(요청과의 연결)
- 검증 명령 결과: `pnpm build` · `pnpm lint` · `pnpm typecheck`

## 5) 도메인 컨텍스트
- **TaskFlow** = 팀 태스크 관리 SaaS (한 줄: 팀의 할 일과 우선순위를 모으고 AI가 우선순위 근거를 제시)
- 핵심 용어: `team` · `member`(role) · `task` · `note`
- 데이터 격리: 모든 데이터는 **team 단위로 격리**. 모든 테이블에 RLS 정책 필수

## 검증 명령
`pnpm build` · `pnpm lint` · `pnpm typecheck` 모두 통과해야 완료로 본다.
