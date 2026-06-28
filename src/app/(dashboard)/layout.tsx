import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/features/nav/AppNav";

/** 보호 라우트 공통 레이아웃: 인증 가드 + 역할 기반 메뉴. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = me?.role === "admin";

  return (
    <>
      <AppNav isAdmin={isAdmin} />
      {children}
    </>
  );
}
