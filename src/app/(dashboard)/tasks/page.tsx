import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateTaskForm } from "@/features/tasks/components/CreateTaskForm";
import { AssignTaskForm } from "@/features/tasks/components/AssignTaskForm";
import { getMyTasks } from "@/features/tasks/queries";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasks, error } = await getMyTasks();

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
              {t.priority} · {t.status} · {t.assignee ? "담당: 나" : "담당 없음"}
            </p>
            <AssignTaskForm taskId={t.id} currentUserId={user.id} assignee={t.assignee} />
          </li>
        ))}
      </ul>
    </main>
  );
}
