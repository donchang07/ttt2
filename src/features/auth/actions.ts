"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; info?: string } | null;

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

/** Single entry point for login/signup, branched by the submit button's intent. */
export async function authenticate(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const intent = String(formData.get("intent") ?? "signin");
  const { email, password } = readCredentials(formData);

  if (!email || password.length < 6) {
    return { error: "이메일과 6자 이상 비밀번호를 입력하세요." };
  }

  const supabase = await createClient();

  if (intent === "signup") {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: `가입 실패: ${error.message}` };
    return { info: "확인 메일을 보냈습니다. 메일 인증 후 로그인하세요." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "로그인 실패: 이메일/비밀번호를 확인하세요." };

  redirect("/tasks");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
