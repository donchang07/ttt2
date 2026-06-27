export type MemberRole = "pm" | "lead" | "member";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  team: string;
  /** ISO date string, e.g. "2026-03-14" */
  joinedAt: string;
  avatarUrl?: string | null;
  stats: {
    assigned: number;
    completed: number;
  };
}
