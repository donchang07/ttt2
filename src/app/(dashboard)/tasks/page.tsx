import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateTaskForm } from "@/features/tasks/components/CreateTaskForm";
import { getMyTasks } from "@/features/tasks/queries";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login"); // 로그아웃 상태는 로그인으로

  const { data: tasks, error } = await getMyTasks();

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">내 태스크</h1>
      <CreateTaskForm />
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="rounded-md border p-3">
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-gray-500">
              {t.priority} · {t.status}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
