# TRD v1 — TaskFlow (A-05-O1)

작성일: 2026-06-27 · 입력: [PRD v1](../day3/PRD_v1.md), [ERD](../day4/ERD.md), [RLS 초안](../day4/rls_policy_draft.md)

## 1. 기술 스택
| 영역 | 선택 | 확인일 |
|---|---|---|
| 프레임워크 | Next.js 15.5.19 (App Router, Turbopack) | 2026-06-27 |
| 언어 | TypeScript strict | 2026-06-27 |
| 스타일 | Tailwind CSS v4 | 2026-06-27 |
| BaaS | Supabase (Auth + Postgres + RLS), @supabase/ssr | 2026-06-27 |
| AI | Claude API (모델/단가는 키 발급 후 확정 — 현재 미확인) | 미정 |
| 배포 | Vercel (GitHub 자동배포) | 2026-06-27 |
| 패키지 | pnpm 11 | 2026-06-27 |

## 2. 아키텍처
```
Browser ──HTTP──> Next.js (Vercel)
  ├─ Server Components / Server Actions ── Supabase (RLS) [publishable key]
  ├─ Route Handlers / Edge ── Claude API           [server-only key]
  └─ Client Components (인터랙션만)
```
- 데이터 접근은 기본 서버에서(@supabase/ssr server client). 클라이언트는 publishable 키만.
- LLM 호출은 서버(Route Handler/Edge)에서만 — Claude API 키 노출 차단.

## 3. API / Server Action
| 동작 | 형태 | 권한 |
|---|---|---|
| 태스크 목록/생성/수정/삭제 | Server Action | authenticated, RLS |
| AI 우선순위 추천 | Route Handler `/api/prioritize` | authenticated, 서버서 Claude 호출 |
| 이벤트 로깅 | Server Action / insert | authenticated |

## 4. 보안
- RLS 전 테이블 적용(team_id 기준), Default Deny.
- 키 분리: `NEXT_PUBLIC_*`(publishable)만 클라이언트, `SUPABASE_SECRET_KEY`·Claude 키는 서버 전용.
- 입력 검증(zod), 보안 헤더(Day18), 미들웨어 세션 갱신(Day11).

## 5. 성능
- 목록은 서버 컴포넌트 + 인덱스(team_id) 활용.
- AI 호출은 캐싱/상한으로 비용·지연 관리(목표 응답 5초 이내 — 키 발급 후 실측 필요).

## ADR-lite (핵심 결정 3개)
### ADR-1: BaaS로 Supabase 채택
- 대안: 자체 Postgres+서버 / Firebase
- 결정: Supabase(RLS로 멀티테넌트 격리 용이, Auth 내장)
- 리스크: 벤더 종속 · 재검토: 트래픽/비용 급증 시 · 확인일 2026-06-27
### ADR-2: 데이터 접근을 서버 우선(@supabase/ssr)
- 대안: 클라이언트 직접 호출
- 결정: 서버 컴포넌트/액션 우선(키 보호·일관 권한)
- 리스크: 일부 인터랙션 지연 · 재검토: UX 병목 시 · 확인일 2026-06-27
### ADR-3: LLM 호출을 서버 전용 Route Handler로
- 대안: 클라이언트에서 직접 Claude 호출
- 결정: 서버 경유(키 노출 방지·캐싱)
- 리스크: 서버 함수 비용 · 재검토: 호출량 급증 시 · 확인일 2026-06-27

> 모델명·단가·응답시간은 Claude API 키 발급(Day10) 후 공식 문서 확인하여 확정. 현재는 "확인 필요".
