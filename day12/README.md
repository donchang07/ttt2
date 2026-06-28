# Day 12 — RAG (노트 검색·근거 기반 답변)

핸드북 Day12(RAG 기초·문서 임베딩)를 TaskFlow에 구현. **하이브리드**: 임베딩=OpenAI `text-embedding-3-small`(1536), 생성=Claude `claude-opus-4-8`(보유 키, OverEdge 취지). Anthropic은 임베딩 모델이 없어 임베딩만 OpenAI.

## 산출물
| 항목 | 위치 | 핸드북 ID |
|---|---|---|
| 셋업 점검표 | [rag_setup_check.md](./rag_setup_check.md) | A-12-O2 |
| 품질 평가(실측) | [rag_quality_eval.md](./rag_quality_eval.md) | A-12-O3 |
| 비용·안전 | [rag_cost_safety.md](./rag_cost_safety.md) | A-12-O4 |
| Day13 데이터 분리 | [day13_workflow_input.md](./day13_workflow_input.md) | A-12-O5 |
| 시드+평가 스크립트 | [seed_eval.mjs](./seed_eval.mjs) | (재현용) |

## 코드 (A-12-O1)
- DB: `document_chunks`(vector 1536) + RLS 4정책 + `match_documents`(SECURITY INVOKER) — 마이그레이션 `day12_rag_document_chunks`
- `src/lib/rag/embed.ts` — splitIntoChunks(500/50) · embedTexts(OpenAI) · embedDocument(INSERT)
- `src/lib/rag/search.ts` — searchDocuments → match_documents RPC
- `src/lib/rag/generate.ts` — generateRAGResponse → 검색 + Claude(근거 기반, "근거 없음" 폴백)
- `src/app/api/rag/embed/route.ts` — POST(인증·검증·임베딩 저장)
- `src/app/api/rag/ask/route.ts` — POST(질문→RAG 답변)

## 실측 결과 (threshold 0.3, top-3)
- 5쿼리 평균 **3.0/3**: 신규팀원(0.51)·우선순위(0.37)·완료태스크 배정(0.59)·임베딩 차원(0.60) 전부 정답, 범위 밖 질의는 "근거 없음" 올바른 거부.
- **A/B 격리**: 계정 B는 A 문서 0건 → RLS per-user 검증.
- 비용 1회 평가 ≈ $0.013(센트 단위).

## 튜닝 메모
핸드북 기본 threshold 0.65/0.7은 text-embedding-3-small·짧은 한국어 문서에 과도(관련 문서 0.35~0.60, 무관 ~0.26) → **0.3 채택**(코드 반영).

## 키/환경
`OPENAI_API_KEY`·`ANTHROPIC_API_KEY`는 `taskflow/.env.local`(서버 전용, gitignore)에 위치. `ttt2/.env`에서 복사함(값 미노출).
