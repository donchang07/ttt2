import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedDocument } from "@/lib/rag/embed";
import { extractPdfText } from "@/lib/rag/pdf";

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB

/** PDF 업로드(multipart) → 텍스트 추출 → 청크·임베딩. 본인(user_id) 소유로 저장. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "PDF 파일을 선택하세요." }, { status: 400 });
  }
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json({ error: "PDF 파일만 업로드할 수 있습니다." }, { status: 400 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "20MB 이하 PDF만 업로드할 수 있습니다." }, { status: 413 });
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const text = (await extractPdfText(bytes)).replace(/\s+/g, " ").trim();
    if (!text) {
      return NextResponse.json(
        { error: "PDF에서 텍스트를 추출하지 못했습니다(스캔 이미지 PDF일 수 있습니다)." },
        { status: 422 },
      );
    }
    const chunkCount = await embedDocument(supabase, user.id, file.name, text);
    return NextResponse.json({ ok: true, chunkCount, documentName: file.name });
  } catch (e) {
    console.error("embed-pdf failed", e);
    return NextResponse.json({ error: "PDF 처리에 실패했습니다." }, { status: 500 });
  }
}
