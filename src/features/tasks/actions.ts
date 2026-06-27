"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateTaskState = { error?: string; ok?: boolean } | null;

export async function createTask(
  _prev: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 80) {
    return { error: "제목은 2~80자여야 합니다." };
  }

  const supabase = await createClient();

  // 1) 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // 2) 사용자 팀 보장 (SECURITY DEFINER RPC)
  const { data: teamId, error: teamError } = await supabase.rpc("ensure_personal_team");
  if (teamError || !teamId) {
    return { error: "팀 준비 실패. 잠시 후 다시 시도하세요." };
  }

  // 3) created_by 는 서버에서 user.id 로 강제 (폼 입력 신뢰 금지)
  const { error } = await supabase.from("tasks").insert({
    title,
    team_id: teamId,
    created_by: user.id,
  });
  if (error) return { error: "저장 실패. 잠시 후 다시 시도하세요." };

  // 4) 목록 캐시 갱신
  revalidatePath("/tasks");
  return { ok: true };
}
