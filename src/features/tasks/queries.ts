import { createClient } from "@/lib/supabase/server";

export type TaskRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

/** 로그인 사용자가 속한 팀의 태스크만 조회한다 (RLS가 팀 격리 + soft delete 필터). */
export async function getMyTasks(): Promise<TaskRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as TaskRow[];
}
