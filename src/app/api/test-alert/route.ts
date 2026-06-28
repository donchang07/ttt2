import { NextRequest, NextResponse } from "next/server";
import { sendAlert } from "@/lib/events/alert";

// 토큰 보호된 알림 점검 엔드포인트. POST만 허용(GET 없음). 토큰 불일치 시 403.
export async function POST(request: NextRequest) {
  const token = request.headers.get("x-test-alert-token");
  if (!process.env.TEST_ALERT_TOKEN || token !== process.env.TEST_ALERT_TOKEN) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const r = await sendAlert(
    "TaskFlow 테스트 알림 — 보이면 Slack 연동 성공!",
    { level: "info" },
    { operation: "test-alert", errorCode: "TEST_ALERT" },
  );
  return NextResponse.json({ ok: r.sent, status: r.status });
}
