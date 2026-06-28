import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { embedTexts } from "./embed";

export type SearchResult = {
  id: string;
  document_name: string;
  chunk_index: number;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
};

/** 질문을 임베딩 → match_documents RPC(코사인 유사도, RLS는 호출자 컨텍스트). */
export async function searchDocuments(
  supabase: SupabaseClient,
  query: string,
  { threshold = 0.3, count = 3 }: { threshold?: number; count?: number } = {},
): Promise<SearchResult[]> {
  const [embedding] = await embedTexts([query]);
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: count,
  });
  if (error) throw error;
  return (data ?? []) as SearchResult[];
}
