import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { UserProfile } from "@/components/user-profile/user-profile";
import type { UserProfile as UserProfileData } from "@/types/user";

const SITE_URL = "https://ttt2-theta.vercel.app";
const HERO_DESCRIPTION =
  "5~15인 팀 PM이 흩어진 할 일을 모아 AI 근거로 우선순위를 정하는 태스크 관리 SaaS";

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
  { id: "u_1", name: "장동인", email: "dongin@taskflow.team", role: "pm", team: "프로덕트", joinedAt: "2026-03-14", stats: { assigned: 24, completed: 21 } },
  { id: "u_2", name: "김서연", email: "seoyeon@taskflow.team", role: "lead", team: "엔지니어링", joinedAt: "2026-04-02", stats: { assigned: 18, completed: 9 } },
  { id: "u_3", name: "이준호", email: "junho@taskflow.team", role: "member", team: "엔지니어링", joinedAt: "2026-05-20", stats: { assigned: 7, completed: 0 } },
];

export default async function Home() {
  const connected = await checkSupabase();

  return (
    <main className="mx-auto max-w-[60rem] px-6 py-12 sm:py-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "TaskFlow",
          description: HERO_DESCRIPTION,
          url: SITE_URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "ko",
          // 실제 근거 생기면 aggregateRating·offers 추가
        }}
      />

      <section className="flex flex-col items-start gap-5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            connected
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {connected ? "Supabase 연결됨 ✓" : "Supabase 연결 실패 ✗"}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          팀의 오늘 우선순위를 30초 안에
        </h1>
        <p className="max-w-[36rem] text-base text-foreground/60">{HERO_DESCRIPTION}</p>
        <Link
          href="/profile"
          className="mt-1 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          팀 둘러보기
        </Link>
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold">팀 멤버</h2>
        <p className="mt-1 text-sm text-foreground/50">역할별 프로필 미리보기</p>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_PROFILES.map((profile) => (
            <UserProfile key={profile.id} profile={profile} />
          ))}
        </div>
      </section>
    </main>
  );
}
