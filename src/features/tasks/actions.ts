"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CreateTaskState = { ok: boolean; message: string };

export async function createTask(
  prevState: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const supabase = await createClient();

  // ① 로그인 확인 — 안 했으면 막는다
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  // ② 입력 검증 — formData를 그대로 믿지 않는다
  const title = String(formData.get("title") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium").trim();
  if (title.length < 2 || title.length > 80) {
    return { ok: false, message: "제목은 2자 이상 80자 이하로 입력하세요." };
  }

  // ③ INSERT — created_by는 서버의 user.id로 강제 (hidden input 신뢰 금지)
  const { error } = await supabase.from("tasks").insert({
    title,
    priority,
    status: "todo",
    created_by: user.id,
  });
  if (error) {
    console.error("createTask failed", { code: error.code });
    return { ok: false, message: "태스크 저장에 실패했습니다." };
  }

  // ④ 목록 화면 캐시 갱신
  revalidatePath("/tasks");
  return { ok: true, message: "태스크가 저장되었습니다." };
}
