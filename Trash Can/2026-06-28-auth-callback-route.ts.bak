import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** 이메일 확인/매직링크 콜백. PKCE code를 세션으로 교환 후 내부 경로로 이동. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/tasks";
  // open redirect 방지: 내부 절대경로만 허용
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/tasks";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`;
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
