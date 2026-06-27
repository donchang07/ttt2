import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateTaskForm } from "@/features/tasks/components/CreateTaskForm";
import { AssignForm, type AssignMember } from "@/features/tasks/AssignForm";
import { getMyTasks } from "@/features/tasks/queries";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasks, error } = await getMyTasks();

  // 오늘은 단순 모델(팀 없음) — 검증 가능한 현재 사용자(본인)만 배정 대상으로 넘긴다.
  // 실제 팀원 목록은 Day11(팀·역할)에서 채운다. 없는 테이블을 만들지 않는다.
  const members: AssignMember[] = [{ id: user.id, label: "나 (본인)" }];

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">내 태스크</h1>
      <CreateTaskForm />
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="space-y-2 rounded-md border p-3">
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-gray-500">
              {t.priority} · {t.status} · 담당:{" "}
              {t.assignee === user.id ? "나" : t.assignee ? "타인" : "미배정"}
            </p>
            <AssignForm taskId={t.id} members={members} currentAssignee={t.assignee} />
          </li>
        ))}
      </ul>
    </main>
  );
}
