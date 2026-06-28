"use client";

import { useActionState } from "react";
import { askNote, type AskState } from "./actions";

const initialState: AskState = { ok: false, message: "" };

export function AskForm() {
  const [state, action, isPending] = useActionState(askNote, initialState);

  return (
    <div className="space-y-3">
      <form action={action} className="space-y-3">
        <input
          name="question"
          placeholder="내 노트에 질문하기"
          className="w-full rounded-md border px-3 py-2"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "검색·생성 중..." : "질문하기"}
        </button>
      </form>

      {state.message && <p className="text-red-600">{state.message}</p>}

      {state.ok && state.answer && (
        <div className="space-y-2 rounded-md border bg-black/[.03] p-3 dark:bg-white/[.04]">
          <p className="whitespace-pre-wrap">{state.answer}</p>
          {state.sources && state.sources.length > 0 && (
            <ul className="border-t pt-2 text-sm text-gray-500">
              {state.sources.map((s, i) => (
                <li key={i}>
                  · {s.document_name} ({Math.round(s.similarity * 100)}%)
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
