# 환경변수 경계 점검표 (Day16 산출물 A-16-O3)

작성일: 2026-06-28 · 3저장소(로컬 `.env.local` / GitHub Secrets / Vercel Env) × 노출 등급. **값 없이 이름만.**

## 등급 정의
- **공개(public)**: 브라우저 노출 OK. RLS로 데이터 보호. `NEXT_PUBLIC_*`.
- **서버 secret**: 클라이언트 노출 금지. 서버(런타임)에서만 사용.
- **절대금지**: 코드·문서·로그·캡처에 노출 불가. service_role 등급.

## 경계표
| 변수 이름 | 노출 등급 | 저장 위치 | 비고 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 공개(RLS 보호) | 로컬·Secrets·Vercel | 빌드타임 필요 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 공개(RLS 보호) | 로컬·Secrets·Vercel | 빌드타임 필요 |
| `SUPABASE_SECRET_KEY` | **절대금지**(service_role 성격) | 로컬·Vercel(서버) | 클라이언트·CI 빌드 불요 |
| `ANTHROPIC_API_KEY` | 서버 secret | 로컬·Vercel(서버) | RAG/워크플로 런타임 |
| `OPENAI_API_KEY` | 서버 secret | 로컬·Vercel(서버) | 임베딩 런타임 |
| `SLACK_WEBHOOK_URL` | 서버 secret | 로컬·Vercel(서버) | 알림 발송 런타임 |
| `ADMIN_PASSWORD` | 서버 secret | 로컬·Vercel(서버) | 관리 경로 |

## CI(GitHub Actions) 주입 범위
- 스모크 빌드에는 **공개 `NEXT_PUBLIC_*` 2종만** `${{ secrets.* }}`로 주입(`smoke-test.yml`).
- 서버 secret·절대금지 키는 CI에 넣지 않음(빌드타임 불요 → 노출면 최소화). 런타임 주입은 Vercel Env 전담.

## 점검 결과
- [x] 표에 실제 값 없음(이름만)
- [x] 공개 / 서버 secret / 절대금지 3등급 모두 구분
- [x] `SUPABASE_SECRET_KEY`를 절대금지로 분류, CI 미주입
- [x] `.env.local`은 git 미추적(`.gitignore`의 `.env*`)
