# Day 16 — CI/CD 최소 구축 (자동배포 + 스모크 테스트)

핸드북 Day16(Track A). "배포는 Vercel · 검증은 Actions" 역할 분리로, push 한 번에 배포+스모크가 자동 도는 최소 파이프라인 구성.

## 산출물
| 항목 | 위치 | 완료기준 |
|---|---|---|
| Vercel Git 연동 점검 | [vercel_git_check.md](./vercel_git_check.md) | A-16-O1(진행) |
| 스모크 워크플로 | [`../.github/workflows/smoke-test.yml`](../.github/workflows/smoke-test.yml) | A-16-O2 |
| 환경변수 경계표 | [env_boundary_check.md](./env_boundary_check.md) | A-16-O3 |
| 첫 배포·스모크 결과 | [first_deploy_result.md](./first_deploy_result.md) | A-16-O1(완성) |
| Day17 관측 입력 | [day17_observability_input.md](./day17_observability_input.md) | A-16-O4 |

## 스택 맞춤(핸드북 npm 예시 → 실제)
- pnpm + Node 24 + Next.js 15(turbopack). CI는 `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm build`.
- 빌드타임 필요 env는 공개 `NEXT_PUBLIC_*` 2종뿐 → GitHub Secrets로만 주입. 서버 secret은 Vercel 런타임 전담.

## 진행 상태
- ✅ smoke-test.yml 작성(타입체크+빌드, secrets 형식 주입, permissions 읽기 전용)
- ✅ Vercel Git 연동 동작(main push → Production 자동배포 실측)
- ✅ 환경변수 3등급 분류(공개/서버 secret/절대금지), `.env.local` 미추적
- ⏳ GitHub Secrets 2종 등록 + feature 브랜치 push → Actions 첫 실행 → first_deploy_result 기입
