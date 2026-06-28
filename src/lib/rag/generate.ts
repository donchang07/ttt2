import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { searchDocuments } from "./search";

const MODEL = "claude-opus-4-8";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type RAGResponse = {
  answer: string;
  sources: { document_name: string; similarity: number }[];
};

const SYSTEM_PROMPT =
  "제공된 문서에만 근거해 한국어로 답하라. 문서가 답의 근거를 제공하지 않으면 정확히 '근거 없음'이라고만 답하라. 개인정보·민감정보(이름·연락처·계약·가격)는 답변에 포함하지 말 것.";

/** 검색(threshold 0.65, 3건) → Claude로 근거 기반 답변 생성. 검색 0건이면 '근거 없음'. */
export async function generateRAGResponse(
  supabase: SupabaseClient,
  userQuestion: string,
): Promise<RAGResponse> {
  // text-embedding-3-small + 짧은 한국어 문서 기준 튜닝값(핸드북 0.65는 과도). day12 진단 근거.
  const results = await searchDocuments(supabase, userQuestion, { threshold: 0.3, count: 3 });
  if (results.length === 0) {
    return { answer: "근거 없음", sources: [] };
  }

  const context = results
    .map((r, i) => `[문서 ${i + 1}: ${r.document_name}]\n${r.content}`)
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `다음 문서를 참고해 질문에 답하라.\n\n${context}\n\n질문: ${userQuestion}`,
      },
    ],
  });

  const answer =
    message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim() || "근거 없음";

  return {
    answer,
    sources: results.map((r) => ({ document_name: r.document_name, similarity: r.similarity })),
  };
}
