"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateTaskState = { error?: string; ok?: boolean } | null;

// 폼 입력 → Server Action → tasks INSERT → revalidatePath → 목록 갱신
export async function createTask(
  _prev: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  // ② 입력 검증 (title 필수 · 길이 제한)
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 1 || title.length > 200) {
    return { error: "제목을 1~200자로 입력하세요." };
  }

  const supabase = await createClient();

  // ① 인증 확인 (없으면 거부)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // ③ created_by = 로그인 사용자 id 로 강제. status/priority/created_at 은 DB 기본값.
  const { error } = await supabase.from("tasks").insert({
    title,
    created_by: user.id,
  });
  if (error) return { error: "저장 실패. 잠시 후 다시 시도하세요." };

  // ④ 목록 캐시 갱신
  revalidatePath("/tasks");
  return { ok: true };
}
