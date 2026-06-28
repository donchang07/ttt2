import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmbedForm } from "@/features/rag/EmbedForm";
import { PdfForm } from "@/features/rag/PdfForm";
import { AskForm } from "@/features/rag/AskForm";

export const metadata: Metadata = {
  title: "노트 검색",
  robots: { index: false },
};

export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS상 본인 청크만 집계·조회
  const { count } = await supabase
    .from("document_chunks")
    .select("id", { count: "exact", head: true });
  const { data: rows } = await supabase
    .from("document_chunks")
    .select("document_name")
    .order("created_at", { ascending: false });
  const docNames = Array.from(new Set((rows ?? []).map((r) => r.document_name as string)));

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">노트 검색 (RAG)</h1>
        <Link href="/tasks" className="text-sm text-blue-600 underline-offset-4 hover:underline">
          태스크로
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">1. 문서 임베딩 (텍스트)</h2>
        <EmbedForm />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">2. PDF 임베딩</h2>
        <PdfForm />
        <p className="text-xs text-gray-400">텍스트 PDF만(스캔 이미지 PDF 미지원) · 최대 8MB · 파일명이 문서명</p>
      </section>

      <p className="text-sm text-gray-500">
        내 문서 {docNames.length}건 · 청크 {count ?? 0}개
        {docNames.length > 0 && ` — ${docNames.slice(0, 8).join(", ")}`}
      </p>

      <section className="space-y-3">
        <h2 className="font-semibold">3. 질문하기</h2>
        <AskForm />
        <p className="text-xs text-gray-400">
          임베딩 OpenAI text-embedding-3-small · 생성 Claude · 본인 문서만 검색(RLS)
        </p>
      </section>
    </main>
  );
}
