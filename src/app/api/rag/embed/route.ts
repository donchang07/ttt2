import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedDocument } from "@/lib/rag/embed";

/** POST { documentName, content } → 청크 임베딩·저장. 본인(user_id) 데이터로만 저장(RLS). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { documentName?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  const documentName = body.documentName?.trim();
  const content = body.content?.trim();
  if (!documentName || !content) {
    return NextResponse.json(
      { error: "documentName과 content가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const chunkCount = await embedDocument(supabase, user.id, documentName, content);
    return NextResponse.json({ ok: true, chunkCount });
  } catch (e) {
    console.error("rag/embed error", e);
    return NextResponse.json({ error: "임베딩 처리에 실패했습니다." }, { status: 500 });
  }
}
