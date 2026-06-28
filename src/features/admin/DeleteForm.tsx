"use client";

import { useState, type FormEvent } from "react";

export function DeleteForm({
  action,
  id,
  confirmText,
  label = "삭제",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmText: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmText)) {
      e.preventDefault();
      return;
    }
    setPending(true);
  }

  return (
    <form action={action} onSubmit={onSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "삭제 중..." : label}
      </button>
    </form>
  );
}
