import "server-only";

import { redactSensitive } from "@/lib/workflow/securityGate";

export type AlertLevel = "info" | "warning" | "error" | "critical";

/**
 * 범용 운영 알림(Slack). 허용 필드만 전송(message·level·errorCode·operation·시각).
 * 민감정보는 보안 게이트로 마스킹, stack trace·PII·context 전체는 보내지 않는다.
 * 전송 실패는 메인 흐름을 막지 않음(throw 없이 결과 반환).
 */
export async function sendAlert(
  message: string,
  { level = "error" }: { level?: AlertLevel } = {},
  context: { errorCode?: string; operation?: string } = {},
): Promise<{ sent: boolean; status?: number }> {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) {
    console.warn("[alert] SLACK_WEBHOOK_URL 미설정 — 스킵");
    return { sent: false };
  }

  const ts = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const safeMsg = redactSensitive(message);
  const body = {
    text: `${level.toUpperCase()} 알림: ${safeMsg}`,
    blocks: [
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*메시지*\n${safeMsg}` },
          { type: "mrkdwn", text: `*시각*\n${ts}` },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `errorCode=${context.errorCode ?? "NA"} operation=${context.operation ?? "NA"} level=${level}`,
          },
        ],
      },
    ],
  };

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!res?.ok) {
    console.error("[alert] Slack 전송 실패", { status: res?.status });
    return { sent: false, status: res?.status };
  }
  return { sent: true, status: res.status };
}
