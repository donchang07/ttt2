import { UserProfile } from "@/components/user-profile/user-profile";
import type { UserProfile as UserProfileData } from "@/types/user";

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

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-[60rem] px-6 py-12 sm:py-20">
      <h1 className="text-2xl font-semibold">사용자 프로필</h1>
      <p className="mt-1 text-sm text-foreground/50">
        TaskFlow 팀 멤버 카드 — 역할별 표시 예시
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_PROFILES.map((profile) => (
          <UserProfile key={profile.id} profile={profile} />
        ))}
      </div>
    </main>
  );
}
