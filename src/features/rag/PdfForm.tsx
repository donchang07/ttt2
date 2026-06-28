"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB

export function PdfForm() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      setMsg({ ok: false, text: "PDF 파일을 선택하세요." });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setMsg({ ok: false, text: "20MB 이하 PDF만 업로드할 수 있습니다." });
      return;
    }

    setPending(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/rag/embed-pdf", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMsg({ ok: true, text: `${data.documentName} — ${data.chunkCount}개 청크 임베딩 완료.` });
        form.reset();
        router.refresh();
      } else {
        setMsg({ ok: false, text: data.error ?? `업로드 실패 (${res.status})` });
      }
    } catch {
      setMsg({ ok: false, text: "네트워크 오류로 실패했습니다." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="file"
        name="file"
        accept="application/pdf,.pdf"
        required
        className="w-full rounded-md border px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "추출·임베딩 중..." : "PDF 임베딩"}
      </button>
      {msg && <p className={msg.ok ? "text-green-700" : "text-red-600"}>{msg.text}</p>}
    </form>
  );
}
