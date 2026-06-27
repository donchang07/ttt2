# 폴더 구조 초안 — feature-based (A-05-O3)

작성일: 2026-06-27 · 입력: PRD Must, [TRD 기술스택](./TRD_v1.md)

```
src/
├─ app/                      # 라우팅 전용 (App Router)
│  ├─ (auth)/login/          # 인증 라우트
│  ├─ tasks/                 # 태스크 페이지(서버 컴포넌트)
│  ├─ profile/               # 프로필
│  ├─ api/
│  │  └─ prioritize/route.ts # AI 우선순위 (server-only, Claude 키 사용)
│  └─ page.tsx               # 홈
├─ features/                 # 기능 단위 (UI + 액션 + 타입)
│  ├─ tasks/
│  │  ├─ components/         # TaskList, TaskItem ...
│  │  ├─ actions.ts         # 서버 액션 (CRUD)
│  │  └─ types.ts
│  ├─ teams/
│  └─ ai-priority/
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts          # 🔓 publishable 키 (브라우저)
│  │  └─ server.ts          # 🔓 publishable 키 (서버, 쿠키)
│  ├─ ai/
│  │  └─ claude.ts          # 🔒 서버 전용 — Claude 키, 클라이언트 import 금지
│  ├─ validation/           # zod 스키마
│  └─ logger/               # 구조화 로깅(Day17)
├─ components/               # 공용 UI (UserProfile 등)
└─ types/                    # 공용 타입
```

## key 노출 경계 주석(원칙)
- `lib/supabase/*` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 사용 (공개 안전)
- `lib/ai/claude.ts` → `🔒 server-only`. Claude 키·`SUPABASE_SECRET_KEY`는 이 경계 밖으로 나가지 않음. 클라이언트 컴포넌트에서 import 금지.
- `app/api/*`, `features/*/actions.ts` → 서버 실행. 민감 키는 여기까지만.

## CLAUDE.md 반영 형식(붙여넣기용)
```
## 폴더 구조
- src/app: 라우팅 전용
- src/features/<도메인>: components·actions·types
- src/lib/supabase: client.ts(브라우저)·server.ts(서버), publishable 키만
- src/lib/ai: 🔒 server-only, Claude 키. 클라이언트 import 금지
- src/lib/validation·logger, src/components, src/types
```
