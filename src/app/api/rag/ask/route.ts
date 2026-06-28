import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRAGResponse } from "@/lib/rag/generate";

/** POST { question } → RAG 답변. 검색은 호출자 RLS 컨텍스트(본인 문서만). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { question?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "question이 필요합니다." }, { status: 400 });
  }

  try {
    const result = await generateRAGResponse(supabase, question);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("rag/ask error", e);
    return NextResponse.json({ error: "답변 생성에 실패했습니다." }, { status: 500 });
  }
}
