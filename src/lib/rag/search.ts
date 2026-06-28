import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { embedWithUsage } from "./embed";

export type SearchResult = {
  id: string;
  document_name: string;
  chunk_index: number;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
};

/** 질문을 임베딩 → match_documents RPC. 결과 + 임베딩 토큰 사용량 반환. */
export async function searchDocumentsWithUsage(
  supabase: SupabaseClient,
  query: string,
  { threshold = 0.3, count = 3 }: { threshold?: number; count?: number } = {},
): Promise<{ results: SearchResult[]; embeddingTokens: number }> {
  const { embeddings, tokens } = await embedWithUsage([query]);
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embeddings[0],
    match_threshold: threshold,
    match_count: count,
  });
  if (error) throw error;
  return { results: (data ?? []) as SearchResult[], embeddingTokens: tokens };
}

/** 질문을 임베딩 → match_documents RPC(코사인 유사도, RLS는 호출자 컨텍스트). */
export async function searchDocuments(
  supabase: SupabaseClient,
  query: string,
  opts: { threshold?: number; count?: number } = {},
): Promise<SearchResult[]> {
  return (await searchDocumentsWithUsage(supabase, query, opts)).results;
}
