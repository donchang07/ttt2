# Day12 접근제어 준비 노트 (Day11 산출물 A-11-O3)

작성일: 2026-06-28 · 근거: 오늘 적용한 RLS 패턴([rls_policy.sql](./rls_policy.sql)), [account_ab_test.md](./account_ab_test.md)

## 1. 왜 검색 결과도 사용자별 필터가 필요한가
- Day12의 노트/RAG 검색은 결국 **임베딩·문서 테이블에 대한 DB 쿼리**다. 벡터 유사도 검색(`order by embedding <-> query`)도 한 테이블을 SELECT한다.
- 이 테이블에 RLS·소유 정책이 없으면, "내 노트 검색"이 **전체 사용자의 노트·임베딩을 반환**한다 → 데이터 유출.
- 따라서 문서/임베딩 테이블도 tasks·notes와 동일하게 **조회 시점에 소유/소속으로 격리**해야 한다(애플리케이션 필터가 아니라 RLS로).

## 2. 소유 컬럼 후보
- `owner_id uuid` — 개인 소유 노트(per-user). tasks와 동일 패턴(`auth.uid() = owner_id`).
- `team_id uuid` — 팀 공유 노트. notes와 동일 패턴(`team_id in (select user_team_ids())`).
- **권고**: TaskFlow 노트는 팀 단위 공유가 핵심이므로 **`team_id` 기반**을 기본으로, 개인 메모가 필요하면 `owner_id` 보조 컬럼 추가.

## 3. 문서/임베딩 테이블 RLS 전략
```sql
alter table public.documents  enable row level security;
alter table public.embeddings enable row level security;

-- 팀 기반(권장)
create policy "documents_select" on public.documents
  for select using (team_id in (select user_team_ids()));
create policy "embeddings_select" on public.embeddings
  for select using (team_id in (select user_team_ids()));
-- INSERT는 created_by = auth.uid() + 소속팀 WITH CHECK (notes_insert 패턴 재사용)
```
- 임베딩 테이블에도 `team_id`(또는 `owner_id`)를 **비정규화로 복제**해 조인 없이 RLS가 걸리게 한다(벡터 검색 성능·정책 단순화).
- service_role 키로 임베딩을 조회/생성하면 RLS가 우회되므로, 검색 경로는 **사용자 토큰(authenticated) 경유**로 고정.

## 4. Day12 사전 준비 체크
- [x] 인증 사용자 컨텍스트 사용 가능(`auth.uid()`, 미들웨어 세션)
- [x] RLS 활성 테이블 패턴 확보(tasks/notes 정책 + 헬퍼 `user_team_ids`)
- [ ] 도메인 문서 10~30건(더미) 준비 — Day12에서 시드
- [ ] 임베딩 API 키 준비 — **Anthropic/임베딩 키 미발급(블로커)**, 발급 후 진행
- [x] 캡처 안전 점검 기준(키·토큰·실데이터 노출 금지) 수립

## 5. 블로커
- 임베딩/Claude API 키 미발급 → Day12(RAG) 실제 임베딩 생성은 키 확보 후. 그 전까지는 스키마·RLS 정책까지 선구축 가능.
