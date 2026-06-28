import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteForm } from "@/features/admin/DeleteForm";
import { deleteTask, deleteUser } from "@/features/admin/actions";

export const metadata: Metadata = {
  title: "관리자 콘솔",
  robots: { index: false },
};

type Profile = { id: string; display_name: string | null; role: string; created_at: string };
type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_by: string | null;
  assignee: string | null;
  created_at: string;
};
type LogRow = { event_type: string; created_at: string };

function since24h(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}
function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function day(iso: string): string {
  return iso.slice(0, 10);
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") redirect("/tasks");

  // 관리자 RLS 오버라이드로 전체 조회(teams/tasks), profiles는 디렉터리 공개, activity_logs는 admin select
  const [teamsRes, logsRes, profilesRes, tasksRes] = await Promise.all([
    supabase.from("teams").select("id, created_at"),
    supabase
      .from("activity_logs")
      .select("event_type, created_at")
      .gte("created_at", since24h())
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("profiles").select("id, display_name, role, created_at").order("created_at"),
    supabase
      .from("tasks")
      .select("id, title, status, priority, created_by, assignee, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const teams = teamsRes.data ?? [];
  const logs = (logsRes.data ?? []) as LogRow[];
  const profiles = (profilesRes.data ?? []) as Profile[];
  const tasks = (tasksRes.data ?? []) as Task[];

  const todayStart = startOfTodayISO();
  const newTeamsToday = teams.filter((t) => (t.created_at as string) >= todayStart).length;
  const errors = logs.filter((l) => l.event_type.startsWith("error"));

  const nameById = new Map(profiles.map((p) => [p.id, p.display_name ?? "(이름없음)"]));
  const nameOf = (id: string | null) => (id ? (nameById.get(id) ?? "알 수 없음") : null);
  const createdCount = new Map<string, number>();
  const assignedCount = new Map<string, number>();
  for (const t of tasks) {
    if (t.created_by) createdCount.set(t.created_by, (createdCount.get(t.created_by) ?? 0) + 1);
    if (t.assignee) assignedCount.set(t.assignee, (assignedCount.get(t.assignee) ?? 0) + 1);
  }
  const assignedTasks = tasks.filter((t) => t.assignee);

  const activityCounts = new Map<string, number>();
  for (const l of logs) {
    if (l.event_type.startsWith("error")) continue;
    activityCounts.set(l.event_type, (activityCounts.get(l.event_type) ?? 0) + 1);
  }
  const errorCounts = new Map<string, number>();
  for (const l of errors) errorCounts.set(l.event_type, (errorCounts.get(l.event_type) ?? 0) + 1);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">관리자 콘솔</h1>

      {/* 1. 핵심 지표 */}
      <section className="space-y-2">
        <h2 className="font-semibold">핵심 지표</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="전체 사용자" value={profiles.length} />
          <Stat label="전체 팀" value={teams.length} />
          <Stat label="전체 태스크" value={tasks.length} />
          <Stat label="오류 (24h)" value={errors.length} />
        </div>
        <p className="text-xs text-gray-400">오늘 신규 팀 {newTeamsToday} · 배정된 태스크 {assignedTasks.length}</p>
      </section>

      {/* 2. 사용자 현황 */}
      <section className="space-y-2">
        <h2 className="font-semibold">사용자 현황 ({profiles.length})</h2>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-black/[.03] text-left text-gray-500 dark:bg-white/[.04]">
              <tr>
                <th className="px-3 py-2">이름</th>
                <th className="px-3 py-2">역할</th>
                <th className="px-3 py-2">만든 태스크</th>
                <th className="px-3 py-2">배정받은</th>
                <th className="px-3 py-2">가입일</th>
                <th className="px-3 py-2">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2">{p.display_name ?? "(이름없음)"}</td>
                  <td className="px-3 py-2">
                    {p.role === "admin" ? (
                      <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">admin</span>
                    ) : (
                      <span className="text-gray-500">user</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{createdCount.get(p.id) ?? 0}</td>
                  <td className="px-3 py-2">{assignedCount.get(p.id) ?? 0}</td>
                  <td className="px-3 py-2 text-gray-500">{day(p.created_at)}</td>
                  <td className="px-3 py-2">
                    {p.id === user.id ? (
                      <span className="text-xs text-gray-300">본인</span>
                    ) : (
                      <DeleteForm
                        action={deleteUser}
                        id={p.id}
                        confirmText={`'${p.display_name ?? "이 사용자"}'와(과) 그가 만든 태스크를 모두 삭제합니다. 되돌릴 수 없습니다. 계속할까요?`}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. 태스크 현황 (배정 포함) */}
      <section className="space-y-2">
        <h2 className="font-semibold">태스크 현황 ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">태스크가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-black/[.03] text-left text-gray-500 dark:bg-white/[.04]">
                <tr>
                  <th className="px-3 py-2">제목</th>
                  <th className="px-3 py-2">상태</th>
                  <th className="px-3 py-2">우선순위</th>
                  <th className="px-3 py-2">만든 사람</th>
                  <th className="px-3 py-2">담당자</th>
                  <th className="px-3 py-2">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2">{t.title}</td>
                    <td className="px-3 py-2">{t.status}</td>
                    <td className="px-3 py-2">{t.priority}</td>
                    <td className="px-3 py-2">{nameOf(t.created_by) ?? "—"}</td>
                    <td className="px-3 py-2">
                      {t.assignee ? (
                        nameOf(t.assignee)
                      ) : (
                        <span className="text-gray-400">미배정</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <DeleteForm
                        action={deleteTask}
                        id={t.id}
                        confirmText={`'${t.title}' 태스크를 삭제할까요?`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. 배정 현황 */}
      <section className="space-y-2">
        <h2 className="font-semibold">배정 현황 ({assignedTasks.length})</h2>
        {assignedTasks.length === 0 ? (
          <p className="text-sm text-gray-500">배정된 태스크가 없습니다.</p>
        ) : (
          <ul className="divide-y rounded-md border text-sm">
            {assignedTasks.map((t) => (
              <li key={t.id} className="flex justify-between px-3 py-2">
                <span>{t.title}</span>
                <span className="text-gray-500">
                  {nameOf(t.created_by) ?? "—"} → <strong>{nameOf(t.assignee)}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5. 최근 활동 / 오류 */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="font-semibold">최근 활동 (24h)</h2>
          {activityCounts.size === 0 ? (
            <p className="text-sm text-gray-500">최근 활동이 없습니다.</p>
          ) : (
            <ul className="divide-y rounded-md border text-sm">
              {[...activityCounts.entries()].map(([type, n]) => (
                <li key={type} className="flex justify-between px-3 py-2">
                  <span>{type}</span>
                  <span className="text-gray-500">{n}건</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2">
          <h2 className="font-semibold">오류 로그 (24h)</h2>
          {errorCounts.size === 0 ? (
            <p className="text-sm text-gray-500">최근 오류가 없습니다.</p>
          ) : (
            <ul className="divide-y rounded-md border text-sm">
              {[...errorCounts.entries()].map(([type, n]) => (
                <li key={type} className="flex justify-between px-3 py-2 text-red-600">
                  <span>{type}</span>
                  <span>{n}건</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="text-xs text-gray-400">관리자 전용 · 데이터 RLS(security.is_admin) 이중 보호 · 활동 로그는 PII 미기록</p>
    </main>
  );
}
