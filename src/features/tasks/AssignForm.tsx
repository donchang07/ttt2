"use client";

import { useActionState } from "react";
import { assignTask } from "./actions";

export type AssignMember = { id: string; label: string };

export function AssignForm({
  taskId,
  members,
  currentAssignee,
}: {
  taskId: string;
  members: AssignMember[];
  currentAssignee: string | null;
}) {
  const [state, formAction] = useActionState(assignTask, {
    ok: false,
    code: "",
    message: "",
  });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="taskId" value={taskId} />
      <select
        name="assignee"
        defaultValue={currentAssignee ?? ""}
        aria-label="담당자"
        className="rounded-md border px-2 py-1 text-sm"
      >
        <option value="">미배정</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded-md border px-3 py-1 text-sm">
        배정
      </button>
      {/* 제출 후 성공·실패 모두 인라인 안내 (흰 화면 없이) */}
      <p
        aria-live="polite"
        className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}
      >
        {state.message}
      </p>
    </form>
  );
}
