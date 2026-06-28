import Link from "next/link";
import { signOut } from "@/features/auth/actions";

/** 로그인 후 공통 메뉴. admin이면 관리자 메뉴 추가 노출. */
export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="border-b border-black/[.08] dark:border-white/[.12]">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/tasks" className="font-bold">
            TaskFlow
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-foreground/70 hover:text-foreground hover:underline">
              관리자
            </Link>
          )}
          <Link href="/tasks" className="text-foreground/70 hover:text-foreground hover:underline">
            태스크
          </Link>
          <Link href="/notes" className="text-foreground/70 hover:text-foreground hover:underline">
            노트
          </Link>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-foreground/50 hover:underline">
            로그아웃
          </button>
        </form>
      </div>
    </nav>
  );
}
