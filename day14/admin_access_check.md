# 관리자 접근 제어 검증 (Day14 산출물)

실행: 2026-06-28 · prod `https://ttt2-theta.vercel.app/admin` · 인증 쿠키 기반 실측(redirect manual).
계정: 관리자=rag-eval-a(role=admin), 일반=rag-eval-b(role=user).

## 4종 테스트 (페이지 + 데이터)

| # | 테스트 | 기대 | 실제 | 판정 |
|---|---|---|---|---|
| 1 | 미인증 `/admin` 접근 | `/login`으로 리다이렉트 | **307 → /login** | ✓ |
| 2 | 관리자 `/admin` 접근 | 200 페이지 렌더 | **200** | ✓ |
| 3 | 일반 사용자 `/admin` 접근 | `/tasks`로 리다이렉트 | **307 → /tasks** | ✓ |
| 4 | 데이터 레벨 RLS — 일반 사용자가 `activity_logs` SELECT | 0행(차단) | **0건** | ✓ |

추가 확인: 관리자가 `activity_logs` SELECT → **4건**(전체 가시). 페이지 리다이렉트와 **독립적으로** 데이터 RLS가 차단됨(두 계층 동시 동작).

## role 자가승격 차단 (단계5 추가항목)

| 테스트 | 기대 | 실제 | 판정 |
|---|---|---|---|
| 일반 사용자가 본인 `profiles.role`을 `'admin'`으로 UPDATE | 변경 안 됨 | **0행 갱신(차단)** | ✓ |

- 차단 메커니즘: `profiles`에는 **UPDATE 정책이 없다**(`20260627000006_profiles_table.sql`은 SELECT 정책만 생성). RLS 활성 + UPDATE 정책 부재 → **default deny**로 모든 사용자 UPDATE 차단. role 승격은 SQL 직접 실행(관리 경로)으로만 가능.

## 결론
- **페이지 계층**: 서버 컴포넌트가 `profiles.role` 검증 → 미인증/비관리자 차단.
- **데이터 계층**: `activity_logs` SELECT 정책 `security.is_admin()` → 일반 사용자 0행.
- 두 계층이 함께 동작해, 리다이렉트를 우회해도 데이터는 노출되지 않음.

## 안전
- 로그·산출물에 웹훅 URL·이메일·API 키·고객 데이터 없음. activity_logs는 ID·이벤트 타입만.
