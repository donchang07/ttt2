import Link from "next/link";
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

  // 배정 대상 = 직원 디렉터리(profiles). 이메일 미노출, 표시 이름만.
  const { data: profiles } = await supabase.from("profiles").select("id, display_name");
  const members: AssignMember[] = (profiles ?? []).map((p) => ({
    id: p.id as string,
    label: p.display_name as string,
  }));
  const nameById = new Map(members.map((m) => [m.id, m.label]));

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 태스크</h1>
        <Link href="/notes" className="text-sm text-blue-600 underline-offset-4 hover:underline">
          노트 검색
        </Link>
      </div>
      <CreateTaskForm />
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="space-y-2 rounded-md border p-3">
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-gray-500">
              {t.priority} · {t.status} · 담당:{" "}
              {t.assignee ? (nameById.get(t.assignee) ?? "알 수 없음") : "미배정"}
            </p>
            <AssignForm taskId={t.id} members={members} currentAssignee={t.assignee} />
          </li>
        ))}
      </ul>
    </main>
  );
}
