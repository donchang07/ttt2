import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyTasks } from "@/features/tasks/queries";
import { CreateTaskForm } from "@/features/tasks/components/CreateTaskForm";
import { signOut } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "내 태스크",
  robots: { index: false },
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await getMyTasks();
  const tasks = data ?? [];

  return (
    <main className="mx-auto max-w-[40rem] px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">내 태스크</h1>
        <form action={signOut}>
          <button className="text-sm text-foreground/50 hover:text-foreground">로그아웃</button>
        </form>
      </div>
      <p className="mt-1 mb-6 text-sm text-foreground/50">{user.email}</p>

      <CreateTaskForm />

      <ul className="mt-8 divide-y divide-black/[.06] dark:divide-white/[.08]">
        {tasks.length === 0 ? (
          <li className="py-10 text-center text-sm text-foreground/40">
            아직 태스크가 없습니다. 위에서 첫 할 일을 추가하세요.
          </li>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-3">
              <span className="inline-block size-2 rounded-full bg-foreground/30" aria-hidden />
              <span className="flex-1 text-sm">{task.title}</span>
              <span className="text-xs text-foreground/40">
                {PRIORITY_LABEL[task.priority] ?? task.priority}
              </span>
              <span className="text-xs text-foreground/40">{task.status}</span>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
