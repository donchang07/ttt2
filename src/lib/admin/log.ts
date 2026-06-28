import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** 활동 로그 적재(베스트-에포트). PII 금지 — ID·이벤트 타입만 기록. RLS: 본인 user_id만 INSERT. */
export async function logEvent(
  supabase: SupabaseClient,
  userId: string,
  eventType: string,
  eventData: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase
    .from("activity_logs")
    .insert({ user_id: userId, event_type: eventType, event_data: eventData });
  if (error) console.error("logEvent failed", { eventType, code: error.code });
}
