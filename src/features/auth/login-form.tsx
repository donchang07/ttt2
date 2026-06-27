"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="text-sm font-medium" htmlFor="email">
        이메일
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="h-11 rounded-lg border border-black/[.12] dark:border-white/[.18] bg-transparent px-3 text-sm outline-none focus:border-foreground/40"
        placeholder="you@team.com"
      />

      <label className="text-sm font-medium" htmlFor="password">
        비밀번호
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="h-11 rounded-lg border border-black/[.12] dark:border-white/[.18] bg-transparent px-3 text-sm outline-none focus:border-foreground/40"
        placeholder="비밀번호"
      />

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-11 rounded-full bg-foreground text-background text-sm font-medium disabled:opacity-60"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
