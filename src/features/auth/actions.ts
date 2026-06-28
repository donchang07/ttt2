"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string } | null;

/** 이메일+비밀번호 로그인. 성공 시 /tasks 로 이동. */
export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력하세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "로그인 실패: 이메일/비밀번호를 확인하세요." };

  redirect("/tasks");
}

/** 이메일+비밀번호 회원가입. 확인메일 비활성 시 즉시 세션→/tasks, 아니면 안내 메시지.
 *  profiles 행은 auth.users INSERT 트리거(handle_new_user)가 자동 생성한다. */
export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력하세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." };
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const emailRedirectTo = `${proto}://${host}/auth/callback`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });
  if (error) {
    return { error: "회원가입 실패: 이미 가입된 이메일이거나 형식이 올바르지 않습니다." };
  }
  if (data.session) {
    redirect("/tasks");
  }
  return { notice: "가입 완료. 메일의 확인 링크를 누르면 로그인됩니다." };
}

/** 로그아웃 후 /login 으로 이동. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
