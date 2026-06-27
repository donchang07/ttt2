# Day 01 — 프로젝트 진단 & 기준선 세팅

TaskFlow(팀 태스크 관리 SaaS) 기준으로 진행한 Day 01 기록.

## 산출물
| ID | 파일 | 용도 |
|----|------|------|
| A-01-O1 | [진단표.md](./진단표.md) | 제품·기술 진단 + 4주 목표 + 리스크 |
| A-01-O2 | `../CLAUDE.md` (루트 유지) | AI 협업 규칙 5요소 |
| A-01-O3 | 아래 비교표 | CLAUDE.md 효과 증거 |
| A-01-O4 | [Day2_입력값.md](./Day2_입력값.md) | Day 02 시장분석 입력값 |

> `CLAUDE.md`는 Claude Code가 프로젝트 루트에서 읽는 기능 파일이라 루트에 그대로 둠.

## 환경 세팅 (Day 00)
- Node v22.14.0, pnpm 11.9.0, Git, Claude Code, VS Code 1.126.0 설치 확인/보완
- `pnpm create next-app@15`로 taskflow 생성 — Next.js 15.5.19, TypeScript strict, App Router, `src/`, Tailwind v4, import alias `@/*`
- `pnpm-workspace.yaml`의 `allowBuilds`로 sharp/unrs-resolver 빌드 승인 (비대화형)
- `package.json`에 `typecheck: "tsc --noEmit"` 추가
- `pnpm dev` → localhost:3000 정상

## Supabase 연결 (Day 01 단계 0)
- `.env.local`에 클라이언트 키(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)와 서버 전용 키(`SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`) 분리
- `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` (@supabase/ssr)
- 랜딩 페이지에 연결 헬스체크 배지 → **연결됨 ✓**
- 검증: publishable 키로 REST 쿼리 시 `404 PGRST205`(테이블 없음) → 인증 정상 확인
- 미해결: `SUPABASE_SECRET_KEY` 값이 admin API에서 401(무효) — Day 11 전에 대시보드에서 재발급 필요

## 보안 점검 (Day 01 단계 2) — 4항목 통과
- `.env.local` git 제외 ✓
- 클라이언트엔 `NEXT_PUBLIC_` 공개 키만 ✓
- secret·service_role 클라이언트 미노출 ✓
- `.env` 미추적 ✓

## 배포
- GitHub `donchang07/ttt2` (main) — 코드 푸시 완료
- Vercel `ttt2` — GitHub 연동(push 시 자동배포), 환경변수 production/preview/development 등록
- 프로덕션: https://ttt2-theta.vercel.app (READY, 연결됨 ✓)

## A-01-O3 — CLAUDE.md 효과 비교
| 항목 | 기준 없음 | CLAUDE.md 있음 |
|------|----------|---------------|
| 파일 위치 | 제각각 | `src/lib/supabase/`로 일치 |
| 타입 | any 혼용 | strict, any 없음 |
| 서버/클라이언트 | 섞임 | server.ts/client.ts 분리 |
| 보안 | secret 노출 위험 | 공개키만 NEXT_PUBLIC_, secret 서버 전용 |
| 검증 | 없음 | build·lint·typecheck 보고 |

## 검증 상태
- `pnpm typecheck` 통과 · `pnpm build` 통과 · `pnpm lint` 통과
