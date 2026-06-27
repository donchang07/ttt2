import Link from "next/link";
import { UserProfile } from "@/components/user-profile/user-profile";
import type { UserProfile as UserProfileData } from "@/types/user";

async function checkSupabase(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

const SAMPLE_PROFILES: UserProfileData[] = [
  {
    id: "u_1",
    name: "장동인",
    email: "dongin@taskflow.team",
    role: "pm",
    team: "프로덕트",
    joinedAt: "2026-03-14",
    stats: { assigned: 24, completed: 21 },
  },
  {
    id: "u_2",
    name: "김서연",
    email: "seoyeon@taskflow.team",
    role: "lead",
    team: "엔지니어링",
    joinedAt: "2026-04-02",
    stats: { assigned: 18, completed: 9 },
  },
  {
    id: "u_3",
    name: "이준호",
    email: "junho@taskflow.team",
    role: "member",
    team: "엔지니어링",
    joinedAt: "2026-05-20",
    stats: { assigned: 7, completed: 0 },
  },
];

export default async function Home() {
  const connected = await checkSupabase();

  return (
    <main className="mx-auto max-w-[60rem] px-6 py-12 sm:py-20">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">TaskFlow</h1>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            connected
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {connected ? "Supabase 연결됨 ✓" : "Supabase 연결 실패 ✗"}
        </span>
      </div>
      <p className="mt-1 text-sm text-foreground/50">팀 멤버 — 역할별 프로필</p>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_PROFILES.map((profile) => (
          <UserProfile key={profile.id} profile={profile} />
        ))}
      </div>

      <p className="mt-10 text-sm text-foreground/50">
        전용 페이지로도 볼 수 있습니다 →{" "}
        <Link href="/profile" className="font-medium underline underline-offset-4">
          /profile
        </Link>
      </p>
    </main>
  );
}
