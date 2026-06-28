import "server-only";

import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";

const EMBED_MODEL = "text-embedding-3-small"; // 1536 dims — must match vector(1536)
const CHUNK_SIZE = 500; // words
const CHUNK_OVERLAP = 50; // words

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** 단어 기준 500단어 청크, 50단어 중첩으로 분할. */
export function splitIntoChunks(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const step = CHUNK_SIZE - CHUNK_OVERLAP;
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + CHUNK_SIZE).join(" "));
    if (i + CHUNK_SIZE >= words.length) break;
  }
  return chunks;
}

/** 임베딩 + 토큰 사용량(비용 계산용). */
export async function embedWithUsage(
  texts: string[],
): Promise<{ embeddings: number[][]; tokens: number }> {
  const res = await openai.embeddings.create({ model: EMBED_MODEL, input: texts });
  return { embeddings: res.data.map((d) => d.embedding), tokens: res.usage?.total_tokens ?? 0 };
}

/** OpenAI text-embedding-3-small로 텍스트 배열을 임베딩(1536차원). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  return (await embedWithUsage(texts)).embeddings;
}

/** 문서를 청크→임베딩→document_chunks INSERT. user_id는 서버에서 강제(RLS). 청크 수 반환. */
export async function embedDocument(
  supabase: SupabaseClient,
  userId: string,
  documentName: string,
  content: string,
): Promise<number> {
  const chunks = splitIntoChunks(content);
  if (chunks.length === 0) return 0;

  const embeddings = await embedTexts(chunks);
  const rows = chunks.map((chunk, i) => ({
    user_id: userId,
    document_name: documentName,
    chunk_index: i,
    content: chunk,
    // pgvector: 벡터 포맷 오류 시 JSON.stringify(embeddings[i])로 교체
    embedding: embeddings[i],
  }));

  const { error } = await supabase.from("document_chunks").insert(rows);
  if (error) throw error;
  return chunks.length;
}
