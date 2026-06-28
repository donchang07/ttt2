# 첫 배포·스모크 실행 결과 (Day16 산출물 A-16-O1 완성)

작성일: 2026-06-28 · 실제 실행 결과만 기록(추측 금지).

## 파이프라인 구성
- **검증(CI)**: GitHub Actions `.github/workflows/smoke-test.yml` — checkout → pnpm → Node24 → `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm build`.
- **배포(CD)**: Vercel Git 연동 — `feature/*`→Preview, `main`→Production.

## 실행 기록 (feature/ci-smoke push)
| 항목 | 결과 |
|---|---|
| Actions run | [runs/28317638135](https://github.com/donchang07/ttt2/actions/runs/28317638135) · **success** |
| typecheck step | ✅ 통과 |
| build step | ✅ 통과 |
| Vercel Preview URL | `https://ttt2-o4lx2ehfe-don-changs-projects.vercel.app` (● Ready, 50s) |
| 스모크 통과 여부 | ✅ 통과(typecheck + build) |

## 첫 실행 실패 → 해결 (1회)
- **증상**: 첫 run([28317597105](https://github.com/donchang07/ttt2/actions/runs/28317597105))에서 `build` 실패 — `Failed to collect page data for /api/rag/ask`.
- **원인**: OpenAI SDK가 모듈 초기화 시점에 `new OpenAI()`를 평가하는데, 빌드타임에 `OPENAI_API_KEY`가 없어 `Missing credentials` throw(Anthropic SDK는 키 없어도 통과하나 OpenAI는 즉시 예외).
- **조치**: 워크플로 build step에 **빌드타임 placeholder 키**(`sk-ci-build-placeholder` 등, 실제 키 아님) 주입. 모듈 초기화만 통과시키며 런타임 LLM 호출은 Vercel secret으로만 수행. 코드 무변경.
- **결과**: 재실행 success.

## 검증 체크
- [x] Actions 모든 step 초록 체크(success)
- [x] Vercel Preview URL 생성(Ready)
- [x] push 한 번으로 검증(Actions) + 배포(Vercel Preview) 자동화
- [x] env는 `${{ secrets.* }}` + 빌드용 placeholder만(실제 서버 secret CI 미주입)
