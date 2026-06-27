import { createClient } from "@/lib/supabase/server";

// 컬럼명은 tasks 스키마와 100% 일치: title·status·priority·assignee·created_by·created_at
export type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string | null;
  created_at: string;
};

/** 로그인 사용자가 만든 태스크 목록(최신순). */
export async function getMyTasks(): Promise<TaskRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, priority, assignee, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as TaskRow[];
}
