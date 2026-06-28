# CLAUDE.md 적용 전/후 비교표 (A-01-O3)

작성일: 2026-06-28 (Day01 산출물 사후 보완) · 근거: [진단표.md](./진단표.md), [루트 CLAUDE.md](../CLAUDE.md)
같은 요청("태스크 생성 슬라이스를 만들어줘")을 기준으로, CLAUDE.md 없을 때(baseline)와 있을 때 AI 산출물이 어떻게 달라지는지 5개 차원으로 대조한다.

| 차원 | CLAUDE.md 없음 (baseline) | CLAUDE.md 있음 | 차이 |
|---|---|---|---|
| **1. 파일 위치** | `pages/` 또는 `app/`에 임의 배치, 컴포넌트·로직 한 파일에 혼재 | `src/features/tasks/`(actions·queries·components), 라우팅은 `src/app/(dashboard)`로 분리 | feature-based 경계가 강제됨 |
| **2. 타입 안전** | `any` 허용, props 타입 생략 | `any` 금지(`unknown`+좁히기), strict 전제 | 런타임 오류를 컴파일 타임으로 이동 |
| **3. 서버/클라 경계** | `'use client'` 남발, 클라에서 직접 DB 호출 시도 | 서버 컴포넌트 우선, 액션은 `'use server'`, 데이터 패칭에 `useEffect` 금지 | 비밀키·DB 접근이 서버로 고정 |
| **4. 보안** | `created_by`를 폼 입력값으로 신뢰, 키를 `NEXT_PUBLIC_`에 노출 위험 | `created_by`는 서버에서 `auth.uid()` 강제, publishable 키만 클라 노출, 모든 테이블 RLS(team_id 격리) | 권한을 서버·RLS에서 재확인 |
| **5. 검증 커맨드** | 검증 절차 불명, "동작하면 끝" | `pnpm typecheck/lint/build` 3종 + 계정 A/B RLS 격리(타 팀 0건) 필수 | 완료 기준이 측정 가능 |

## 결론
CLAUDE.md는 최소 5개 차원 전부에서 baseline 대비 1개 이상 명확한 차이를 만든다. 특히 **보안(차원 4)**과 **서버 경계(차원 3)**는 멀티테넌트 SaaS에서 데이터 격리 사고를 막는 직접적 가드레일로 작동한다.
