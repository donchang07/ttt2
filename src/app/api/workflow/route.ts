import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { runWorkflow } from "@/lib/workflow/engine";
import { workflowSteps } from "@/lib/workflow/steps";

/** POST { query } → 다단계 워크플로 실행. StepResult[] + 요약/리포트 반환(원문 청크는 미반환). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "query가 필요합니다." }, { status: 400 });
  }

  const runId = randomUUID().slice(0, 8);
  const ctx = { query, runId, results: {} as Record<string, unknown>, supabase, startTime: Date.now() };
  const steps = await runWorkflow(workflowSteps, ctx);

  return NextResponse.json({
    runId,
    steps,
    summary: (ctx.results["summary"] as string | undefined) ?? null,
    report: (ctx.results["report"] as string | undefined) ?? null,
  });
}
