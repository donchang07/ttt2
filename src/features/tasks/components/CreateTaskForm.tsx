"use client";

import { useActionState } from "react";
import { createTask } from "../actions";

const initialState = { ok: false, message: "" };

export function CreateTaskForm() {
  const [state, formAction, isPending] = useActionState(createTask, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="title"
        placeholder="태스크 제목"
        className="w-full rounded-md border px-3 py-2"
        required
      />
      <select name="priority" defaultValue="medium" className="w-full rounded-md border px-3 py-2">
        <option value="high">높음</option>
        <option value="medium">보통</option>
        <option value="low">낮음</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "저장 중..." : "태스크 추가"}
      </button>
      {state.message && (
        <p className={state.ok ? "text-green-700" : "text-red-600"}>{state.message}</p>
      )}
    </form>
  );
}
