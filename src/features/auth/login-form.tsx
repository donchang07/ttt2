"use client";

import { useActionState } from "react";
import { authenticate, type AuthState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(authenticate, null);

  return (
    <form className="flex flex-col gap-3">
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
        placeholder="6자 이상"
      />

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.info && <p className="text-sm text-green-600 dark:text-green-400">{state.info}</p>}

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          name="intent"
          value="signin"
          disabled={pending}
          formAction={action}
          className="h-11 flex-1 rounded-full bg-foreground text-background text-sm font-medium disabled:opacity-60"
        >
          {pending ? "처리 중..." : "로그인"}
        </button>
        <button
          type="submit"
          name="intent"
          value="signup"
          disabled={pending}
          formAction={action}
          className="h-11 flex-1 rounded-full border border-black/[.12] dark:border-white/[.18] text-sm font-medium disabled:opacity-60"
        >
          가입
        </button>
      </div>
    </form>
  );
}
