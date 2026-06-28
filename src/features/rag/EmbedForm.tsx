"use client";

import { useActionState } from "react";
import { embedNote, type EmbedState } from "./actions";

const initialState: EmbedState = { ok: false, message: "" };

export function EmbedForm() {
  const [state, action, isPending] = useActionState(embedNote, initialState);

  return (
    <form action={action} className="space-y-3">
      <input
        name="documentName"
        placeholder="문서 제목 (예: 온보딩 가이드)"
        className="w-full rounded-md border px-3 py-2"
        required
      />
      <textarea
        name="content"
        placeholder="문서 내용을 붙여넣기"
        rows={5}
        className="w-full rounded-md border px-3 py-2"
        required
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "임베딩 중..." : "문서 임베딩"}
      </button>
      {state.message && (
        <p className={state.ok ? "text-green-700" : "text-red-600"}>{state.message}</p>
      )}
    </form>
  );
}
