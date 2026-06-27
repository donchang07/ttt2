"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask } from "../actions";

const INITIAL = { ok: false, message: "" };

export function CreateTaskForm() {
  const [state, action, pending] = useActionState(createTask, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="title"
          required
          maxLength={80}
          placeholder="할 일을 입력하세요 (2~80자)"
          className="h-11 flex-1 rounded-lg border border-black/[.12] dark:border-white/[.18] bg-transparent px-3 text-sm outline-none focus:border-foreground/40"
        />
        <select
          name="priority"
          defaultValue="medium"
          aria-label="우선순위"
          className="h-11 rounded-lg border border-black/[.12] dark:border-white/[.18] bg-transparent px-2 text-sm outline-none focus:border-foreground/40"
        >
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-60"
        >
          {pending ? "추가 중..." : "추가"}
        </button>
      </div>
      {state.message && (
        <p
          className={
            state.ok
              ? "text-sm text-green-600 dark:text-green-400"
              : "text-sm text-red-600 dark:text-red-400"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
