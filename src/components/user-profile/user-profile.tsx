import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MemberRole, UserProfile as UserProfileData } from "@/types/user";

const ROLE_META: Record<MemberRole, { label: string; badge: string; dot: string }> = {
  pm: {
    label: "PM",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  lead: {
    label: "팀리드",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  member: {
    label: "팀원",
    badge: "bg-black/[.06] text-foreground/70 dark:bg-white/[.1]",
    dot: "bg-foreground/40",
  },
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "");
}

function formatJoined(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 합류`;
}

export function UserProfile({ profile }: { profile: UserProfileData }) {
  const role = ROLE_META[profile.role];
  const { assigned, completed } = profile.stats;
  const rate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

  return (
    <article className="w-full max-w-[28rem] rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-background p-6">
      <header className="flex items-center gap-4">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={`${profile.name} 프로필 이미지`}
            width={56}
            height={56}
            className="size-14 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-14 items-center justify-center rounded-full bg-foreground text-background text-lg font-semibold uppercase"
          >
            {initials(profile.name)}
          </div>
        )}

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{profile.name}</h2>
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              role.badge,
            )}
          >
            <span className={cn("size-1.5 rounded-full", role.dot)} aria-hidden />
            {role.label}
          </span>
        </div>
      </header>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-foreground/50">이메일</dt>
          <dd className="truncate font-medium">{profile.email}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-foreground/50">팀</dt>
          <dd className="font-medium">{profile.team}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-foreground/50">합류</dt>
          <dd className="font-medium">{formatJoined(profile.joinedAt)}</dd>
        </div>
      </dl>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-black/[.08] dark:border-white/[.145] pt-5">
        <Stat label="할당" value={assigned} />
        <Stat label="완료" value={completed} />
        <Stat label="완료율" value={`${rate}%`} />
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-foreground/50">{label}</div>
    </div>
  );
}
