# 첫 배포·스모크 실행 결과 (Day16 산출물 A-16-O1 완성)

작성일: 2026-06-28 · 실제 실행 결과만 기록(추측 금지).

## 파이프라인 구성
- **검증(CI)**: GitHub Actions `.github/workflows/smoke-test.yml` — checkout → pnpm → Node24 → `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm build`.
- **배포(CD)**: Vercel Git 연동 — `feature/*`→Preview, `main`→Production.

## 실행 기록 (feature/ci-smoke push)
| 항목 | 결과 |
|---|---|
| Actions run 링크 | _(push 후 기입: github.com/donchang07/ttt2/actions)_ |
| typecheck step | _(대기)_ |
| build step | _(대기)_ |
| Vercel Preview URL | _(push 후 Vercel이 생성)_ |
| 스모크 통과 여부 | _(대기)_ |

## 실패 시 조치
- 빌드 실패(NEXT_PUBLIC 누락): GitHub Secrets에 `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 등록 확인.
- typecheck 실패: 로컬 `pnpm typecheck` 재현 후 수정.

> 이 문서는 feature/ci-smoke push로 Actions가 실제 실행된 뒤 결과로 채운다.
