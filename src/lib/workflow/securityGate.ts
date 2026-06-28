import "server-only";

// 외부 전송 전 차단/마스킹 대상. anthropic_key를 openai_key보다 먼저(접두 sk-ant-).
const PATTERNS: { name: string; source: string }[] = [
  { name: "email", source: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+" },
  { name: "phone", source: "\\b0\\d{1,2}[-\\s]?\\d{3,4}[-\\s]?\\d{4}\\b" },
  { name: "anthropic_key", source: "sk-ant-[A-Za-z0-9_-]{16,}" },
  { name: "openai_key", source: "sk-[A-Za-z0-9_-]{16,}" },
  { name: "supabase_key", source: "sb_(?:secret|publishable)_[A-Za-z0-9]+" },
  { name: "slack_webhook", source: "https://hooks\\.slack\\.com/services/\\S+" },
];

/** 텍스트에 포함된 민감 패턴 이름 목록. */
export function scanSensitive(text: string): string[] {
  const found = new Set<string>();
  for (const { name, source } of PATTERNS) {
    if (new RegExp(source).test(text)) found.add(name);
  }
  return [...found];
}

/** 민감 패턴을 [REDACTED:name]으로 치환. */
export function redactSensitive(text: string): string {
  let out = text;
  for (const { name, source } of PATTERNS) {
    out = out.replace(new RegExp(source, "g"), `[REDACTED:${name}]`);
  }
  return out;
}
