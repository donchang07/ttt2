"use client";

import { useActionState } from "react";
import { assignTask } from "../actions";

const initial = { ok: false, code: "", message: "" };

export function AssignTaskForm({
  taskId,
  currentUserId,
  assignee,
}: {
  taskId: string;
  currentUserId: string;
  assignee: string | null;
}) {
  const [state, action, pending] = useActionState(assignTask, initial);
  const assignedToMe = assignee === currentUserId;

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="taskId" value={taskId} />
      <button
        type="submit"
        name="assignee"
        value={currentUserId}
        disabled={pending || assignedToMe}
        className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
      >
        나에게 배정
      </button>
      <button
        type="submit"
        name="assignee"
        value=""
        disabled={pending || !assignee}
        className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
      >
        해제
      </button>
      {state.message && (
        <span className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </span>
      )}
    </form>
  );
}
