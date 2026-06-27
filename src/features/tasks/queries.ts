import { createClient } from "@/lib/supabase/server";

export async function getMyTasks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "로그인이 필요합니다." };

  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, priority, assignee, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyTasks failed", { code: error.code });
    return { data: [], error: "태스크 목록을 불러오지 못했습니다." };
  }
  return { data, error: null };
}
