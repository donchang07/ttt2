# RAG 셋업 점검표 (Day12 산출물 A-12-O2)

작성일: 2026-06-28 · 대상 DB: Supabase `nujyfmrawlutenuatnzt`(ttt2) · 실측 기반

| 점검 항목 | 상태 | 근거 |
|---|---|---|
| 모델 ↔ 차원 일치 | ✓ | OpenAI `text-embedding-3-small` = **1536차원** = `embedding vector(1536)` |
| pgvector 활성 | ✓ | `vector` 0.8.0 |
| 테이블 스키마 | ✓ | `document_chunks(id uuid, user_id uuid→auth.users, document_name text, chunk_index int, content text, embedding vector(1536), metadata jsonb, created_at)` |
| RLS 4정책 | ✓ | SELECT/INSERT/UPDATE/DELETE 모두 `auth.uid() = user_id` (pg_policies 4건) |
| 검색 함수 | ✓ | `match_documents(query_embedding vector(1536), match_threshold float, match_count int)` — **SECURITY INVOKER**, 내부 `where user_id = auth.uid()`, 외부 user_id 파라미터 없음 |
| ANN 인덱스 | ✓ | `hnsw (embedding vector_cosine_ops)` (빈 테이블에서도 안전) |
| 벡터 INSERT 포맷 | ✓ | supabase-js에 **배열(number[]) 직접 전달**로 정상 저장(실측). 포맷 오류 시 `JSON.stringify(vec)` 폴백(코드에 기록) |
| API 키 위치 | ✓ | `OPENAI_API_KEY`·`ANTHROPIC_API_KEY` → `taskflow/.env.local`(서버 전용, gitignore). `NEXT_PUBLIC_` 미사용 |
| 문서 안전성 | ✓ | 더미 TaskFlow 문서 12종, 실명·연락처·계약·가격 없음 |

## 주의 (advisor WARN)
- **extension_in_public**: `vector` 확장이 `public` 스키마에 설치됨. `extensions` 스키마로 옮기면 `match_documents`의 `<=>` 연산자가 `search_path`에서 안 보여 깨지므로(함수는 `set search_path = public`), **public 유지**. 운영 강화 시 함수 search_path를 `public, extensions`로 바꾸고 확장 이동.

## 하이브리드 구성
- **임베딩 = OpenAI** text-embedding-3-small (Anthropic은 임베딩 모델 없음)
- **생성 = Claude** `claude-opus-4-8` (보유 키 활용, OverEdge 과정 취지)
