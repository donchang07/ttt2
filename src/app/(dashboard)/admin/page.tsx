import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "관리자 콘솔",
  robots: { index: false },
};

type LogRow = {
  event_type: string;
  created_at: string;
  event_data: Record<string, unknown>;
};

function since24h(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}
function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
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
  if (!user) redirect("/login"); // 미인증 → 로그인

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") redirect("/tasks"); // 비관리자 → 태스크

  // 관리자 RLS로 전체 조회(teams는 admin override, activity_logs는 select admin)
  const [teamsRes, logsRes] = await Promise.all([
    supabase.from("teams").select("id, created_at"),
    supabase
      .from("activity_logs")
      .select("event_type, created_at, event_data")
      .gte("created_at", since24h())
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const teams = teamsRes.data ?? [];
  const todayStart = startOfTodayISO();
  const newTeamsToday = teams.filter((t) => (t.created_at as string) >= todayStart).length;

  const logs = (logsRes.data ?? []) as LogRow[];
  const errors = logs.filter((l) => l.event_type.startsWith("error"));

  const activityCounts = new Map<string, number>();
  for (const l of logs) {
    if (l.event_type.startsWith("error")) continue;
    activityCounts.set(l.event_type, (activityCounts.get(l.event_type) ?? 0) + 1);
  }
  const errorCounts = new Map<string, number>();
  for (const l of errors) errorCounts.set(l.event_type, (errorCounts.get(l.event_type) ?? 0) + 1);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">관리자 콘솔</h1>

      <section className="space-y-2">
        <h2 className="font-semibold">1. 핵심 지표</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="전체 팀" value={teams.length} />
          <Stat label="오늘 신규 팀" value={newTeamsToday} />
          <Stat label="오류 (24h)" value={errors.length} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. 최근 활동 (24시간)</h2>
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
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. 오류 로그 (24시간)</h2>
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
      </section>

      <p className="text-xs text-gray-400">관리자 전용 · 데이터는 RLS(security.is_admin)로 이중 보호 · PII 미기록</p>
    </main>
  );
}
