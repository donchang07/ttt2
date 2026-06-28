# Vercel Git 연동 점검 (Day16 산출물 A-16-O1)

작성일: 2026-06-28 · 배포는 Vercel, 검증은 Actions(역할 분리).

## 프로젝트 연결
| 항목 | 값 |
|---|---|
| Vercel 프로젝트 | `don-changs-projects/ttt2` |
| 저장소 | `github.com/donchang07/ttt2` |
| Framework Preset | Next.js (자동 감지) |
| Node 버전 | 24.x |
| Production URL | `https://ttt2-theta.vercel.app` |

## 브랜치 흐름
| 브랜치 | 배포 대상 | URL |
|---|---|---|
| `main` | **Production** | `ttt2-theta.vercel.app` (alias 고정) |
| `feature/*`·`fix/*` | **Preview** | 배포별 임의 URL(`ttt2-<hash>-…vercel.app`) |

## 연동 확인(실측)
- `main`에 push(`cafb410`) 직후 Vercel에 새 **Production 배포 자동 생성** 확인(`vercel ls` 최상단, push 시각과 일치) → main=Production 자동배포 연결 동작.
- CLI 수동 배포(`vercel --prod`)와 Git 자동배포 모두 동일 프로젝트로 수렴.

## 환경변수 등록
- Vercel Environment Variables(Production·Preview·Development)에 런타임 키 등록됨(이름만, 값 미기재 — `env_boundary_check.md` 참조).
- 빌드타임 필요 키는 공개 `NEXT_PUBLIC_*` 2종뿐.
