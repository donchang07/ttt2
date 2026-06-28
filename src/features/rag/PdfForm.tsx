"use client";

import { useActionState } from "react";
import { embedPdf, type EmbedState } from "./actions";

const initialState: EmbedState = { ok: false, message: "" };

export function PdfForm() {
  const [state, action, isPending] = useActionState(embedPdf, initialState);

  return (
    <form action={action} className="space-y-3">
      <input
        type="file"
        name="file"
        accept="application/pdf,.pdf"
        required
        className="w-full rounded-md border px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "추출·임베딩 중..." : "PDF 임베딩"}
      </button>
      {state.message && (
        <p className={state.ok ? "text-green-700" : "text-red-600"}>{state.message}</p>
      )}
    </form>
  );
}
