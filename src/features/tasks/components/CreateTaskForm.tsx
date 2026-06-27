"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask, type CreateTaskState } from "../actions";

export function CreateTaskForm() {
  const [state, action, pending] = useActionState<CreateTaskState, FormData>(createTask, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="title"
          required
          maxLength={200}
          placeholder="할 일을 입력하세요"
          className="h-11 flex-1 rounded-lg border border-black/[.12] dark:border-white/[.18] bg-transparent px-3 text-sm outline-none focus:border-foreground/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-60"
        >
          {pending ? "추가 중..." : "추가"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
