# Day 08 Skill 후보 (A-07-O3)

작성일: 2026-06-27 · 근거: [CLAUDE.md 정식판](../CLAUDE.md), [slice1_plan](./slice1_plan.md), [slice1_verification](./slice1_verification.md), 그리고 이 세션에서 반복된 지시.
형식: [후보 이름 / 만들 가치(왜 자동화) / 입력 / 출력 형식]

## 후보 1 — slice-scaffold
- **후보 이름**: `slice-scaffold` (Vertical Slice 4파일 뼈대 생성)
- **만들 가치**: 태스크 슬라이스마다 `actions.ts`·`queries.ts`·`components/<Form>.tsx`·`app/(dashboard)/.../page.tsx`를 같은 구조로 매번 손으로 만듦(feature-based). 반복 보일러플레이트 제거.
- **입력**: 도메인명(예: tasks), 테이블 컬럼(주요/기본값), 보호 라우트 경로
- **출력 형식**: 4개 파일 스텁 세트(서버액션+쿼리+클라이언트폼+페이지) + import 배선

## 후보 2 — auth-guarded-action
- **후보 이름**: `auth-guarded-action` (서버 액션 템플릿)
- **만들 가치**: 이 세션 내내 액션마다 `'use server'` → `getUser()` 인증 거부 → 입력 검증 → `created_by = user.id` 서버 강제(폼 신뢰 금지) → `revalidatePath` 흐름을 반복 설명·작성. CLAUDE.md 보안 규칙(서버 권한 재확인)과 직결.
- **입력**: 액션명, 대상 테이블, 검증 규칙(필드·길이), revalidate 경로
- **출력 형식**: `{ ok, message }` 반환형 actions.ts 스텁(인증·검증·INSERT·revalidate 포함)

## 후보 3 — slice-verify
- **후보 이름**: `slice-verify` (슬라이스 검증 러너)
- **만들 가치**: 매 슬라이스마다 `typecheck → lint → build` + REST E2E(login→insert→select) + **계정 A/B RLS 격리(타인 0건)**를 수동 반복. slice1_verification 표를 자동 생성.
- **입력**: 라우트(/tasks), 테이블, 검증용 계정 A/B 자격
- **출력 형식**: 검증 체크표(명령별 통과/실패 + A/B 격리 결과) = slice_verification.md

## 후보 4 — schema-sync
- **후보 이름**: `schema-sync` (설계 ↔ DB ↔ 코드 컬럼 대조)
- **만들 가치**: 오늘 반복적으로 터진 불일치(team_id vs per-user, `assignee` vs `assignee_id`, `priority` int vs text, `if not exists` no-op)를 손으로 대조·수습. 설계 문서·실제 DB·코드 INSERT/SELECT의 컬럼을 한 번에 비교.
- **입력**: 테이블명(tasks)
- **출력 형식**: 3열 diff 표(설계 ERD / 적용 DB / 코드 사용 컬럼) + 불일치 시 마이그레이션 제안 SQL

> Day 08 우선순위: **#2 auth-guarded-action**, **#1 slice-scaffold**(빈도 최상). #3·#4는 검증·동기화 안정화용.
