"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { embedDocument } from "@/lib/rag/embed";
import { extractPdfText } from "@/lib/rag/pdf";
import { generateRAGResponse } from "@/lib/rag/generate";

const MAX_PDF_BYTES = 8 * 1024 * 1024; // 8MB

export type EmbedState = { ok: boolean; message: string };

/** 문서를 청크·임베딩해 본인(user_id) 소유로 저장. */
export async function embedNote(prevState: EmbedState, formData: FormData): Promise<EmbedState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const documentName = String(formData.get("documentName") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!documentName || !content) {
    return { ok: false, message: "문서 제목과 내용을 입력하세요." };
  }

  try {
    const chunkCount = await embedDocument(supabase, user.id, documentName, content);
    revalidatePath("/notes");
    return { ok: true, message: `저장 완료 — ${chunkCount}개 청크를 임베딩했습니다.` };
  } catch (e) {
    console.error("embedNote failed", e);
    return { ok: false, message: "임베딩 처리에 실패했습니다. (서버 키 설정을 확인하세요)" };
  }
}

/** 업로드된 PDF에서 텍스트 추출 → 청크·임베딩(파일명을 문서명으로). */
export async function embedPdf(prevState: EmbedState, formData: FormData): Promise<EmbedState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "PDF 파일을 선택하세요." };
  }
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return { ok: false, message: "PDF 파일만 업로드할 수 있습니다." };
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, message: "8MB 이하 PDF만 업로드할 수 있습니다." };
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const raw = await extractPdfText(bytes);
    const text = raw.replace(/\s+/g, " ").trim();
    if (!text) {
      return {
        ok: false,
        message: "PDF에서 텍스트를 추출하지 못했습니다(스캔 이미지 PDF일 수 있습니다).",
      };
    }
    const chunkCount = await embedDocument(supabase, user.id, file.name, text);
    revalidatePath("/notes");
    return { ok: true, message: `${file.name} — ${chunkCount}개 청크 임베딩 완료.` };
  } catch (e) {
    console.error("embedPdf failed", e);
    return { ok: false, message: "PDF 처리에 실패했습니다." };
  }
}

export type AskState = {
  ok: boolean;
  message: string;
  answer?: string;
  sources?: { document_name: string; similarity: number }[];
};

/** 내 문서에서 검색(RLS) → Claude로 근거 기반 답변 생성. */
export async function askNote(prevState: AskState, formData: FormData): Promise<AskState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const question = String(formData.get("question") ?? "").trim();
  if (!question) return { ok: false, message: "질문을 입력하세요." };

  try {
    const { answer, sources } = await generateRAGResponse(supabase, question);
    return { ok: true, message: "", answer, sources };
  } catch (e) {
    console.error("askNote failed", e);
    return { ok: false, message: "답변 생성에 실패했습니다. (서버 키 설정을 확인하세요)" };
  }
}
