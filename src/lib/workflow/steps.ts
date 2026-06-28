import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { searchDocuments, type SearchResult } from "@/lib/rag/search";
import { StepError, type WorkflowContext, type WorkflowStep } from "./engine";
import { redactSensitive, scanSensitive } from "./securityGate";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const LOOP_MODEL = "claude-haiku-4-5"; // 요약/평가 루프(빠르고 저렴). 임베딩은 OpenAI.

const MIN_SCORE = 75;
const MAX_ITER = 3; // LLM 호출 최대 6회(생성 3 + 평가 3)

function getSupabase(ctx: WorkflowContext): SupabaseClient {
  return ctx.supabase as SupabaseClient;
}
function textOf(msg: Anthropic.Message): string {
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
function contextText(chunks: SearchResult[]): string {
  return chunks.map((c, i) => `[${i + 1}] ${c.content}`).join("\n\n");
}

// 1) 검색 — Day12 RAG. 결과 없으면 NO_RESULTS.
export const searchStep: WorkflowStep = {
  name: "search",
  timeoutMs: 8000,
  async run(ctx) {
    const results = await searchDocuments(getSupabase(ctx), ctx.query, { threshold: 0.3, count: 5 });
    if (results.length === 0) throw new StepError("NO_RESULTS", "검색 결과 없음");
    return {
      output: results,
      outputSummary: `${results.length}개 청크 검색(최대 유사도 ${results[0].similarity.toFixed(2)})`,
    };
  },
};

async function generateSummary(
  query: string,
  chunks: SearchResult[],
  feedback?: string,
): Promise<string> {
  const sys =
    "제공된 문서 발췌에만 근거해 한국어로 간결히 요약하라. 핵심 문장마다 [번호] 인용을 달고, 문서에 없는 내용은 쓰지 말 것.";
  const user =
    (feedback ? `이전 요약 개선 피드백: ${feedback}\n\n` : "") +
    `문서 발췌:\n${contextText(chunks)}\n\n요약 대상 질문: ${query}`;
  const msg = await anthropic.messages.create({
    model: LOOP_MODEL,
    max_tokens: 700,
    system: sys,
    messages: [{ role: "user", content: user }],
  });
  return textOf(msg);
}

async function evaluateSummary(
  summary: string,
  chunks: SearchResult[],
): Promise<{ score: number; feedback: string }> {
  const sys =
    '요약 품질을 0~100 정수로 평가하라. 기준: (1) [번호] 인용 존재 (2) 문서 내용 충실 반영 (3) 간결성. JSON 한 줄만 출력: {"score": <정수>, "feedback": "개선점 한 문장"}';
  const msg = await anthropic.messages.create({
    model: LOOP_MODEL,
    max_tokens: 200,
    system: sys,
    messages: [{ role: "user", content: `문서 발췌:\n${contextText(chunks)}\n\n평가할 요약:\n${summary}` }],
  });
  const m = textOf(msg).match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const j = JSON.parse(m[0]);
      return {
        score: Math.max(0, Math.min(100, Number(j.score) || 0)),
        feedback: String(j.feedback ?? ""),
      };
    } catch {
      /* fallthrough */
    }
  }
  return { score: 0, feedback: "평가 파싱 실패" };
}

// 2) 요약 — 생성→평가→재시도 자기개선 루프(minScore 75, 최대 3회, 조기 종료).
export const summarizeStep: WorkflowStep = {
  name: "summarize",
  timeoutMs: 15000,
  async run(ctx) {
    const chunks = (ctx.results["search"] as SearchResult[]) ?? [];
    let best = { summary: "", score: -1 };
    let iterations = 0;
    let feedback: string | undefined;

    for (let i = 0; i < MAX_ITER; i++) {
      iterations = i + 1;
      const summary = await generateSummary(ctx.query, chunks, feedback);
      const ev = await evaluateSummary(summary, chunks);
      if (ev.score > best.score) best = { summary, score: ev.score };
      if (ev.score >= MIN_SCORE) break; // 조기 종료
      feedback = ev.feedback;
    }

    ctx.results["summary"] = best.summary;
    return {
      output: { summary: best.summary, score: best.score, iterations },
      outputSummary: `요약 완료(점수 ${best.score}, ${iterations}회 반복)`,
    };
  },
};

// 3) 리포트 — 마크다운 생성. 로컬에서만 reports/에 저장(서버리스는 영속 불가).
export const reportStep: WorkflowStep = {
  name: "report",
  timeoutMs: 8000,
  async run(ctx) {
    const summary = (ctx.results["summary"] as string) ?? "";
    const date = new Date().toISOString().slice(0, 10);
    const md = `# 워크플로 리포트 — ${ctx.query}\n\n- runId: ${ctx.runId}\n- 생성: ${new Date().toISOString()}\n\n## 요약\n\n${summary}\n`;
    ctx.results["report"] = md;

    if (!process.env.VERCEL) {
      try {
        const fs = await import("node:fs/promises");
        await fs.mkdir("reports", { recursive: true });
        await fs.writeFile(`reports/${date}-${ctx.runId}.md`, md, "utf8");
      } catch {
        /* best-effort: 영속 저장 실패는 무시 */
      }
    }
    return { output: md, outputSummary: `리포트 생성(${md.length}자)` };
  },
};

// 4) 알림(선택) — Slack 웹훅. 보안 게이트로 외부 전송 전 마스킹.
export const notifyStep: WorkflowStep = {
  name: "notify",
  timeoutMs: 5000,
  optional: true,
  async run(ctx) {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) return { output: null, outputSummary: "Slack 미설정 → 알림 생략" };

    const summary = (ctx.results["summary"] as string) ?? "";
    const flagged = scanSensitive(summary);
    const safeText = redactSensitive(summary).slice(0, 1500);

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `워크플로 요약 (${ctx.query})\n${safeText}` }),
    });
    if (!res.ok) throw new StepError("NOTIFY_FAILED", `slack ${res.status}`);
    return {
      output: { flagged },
      outputSummary: `Slack 전송 완료(마스킹: ${flagged.join(",") || "없음"})`,
    };
  },
};

export const workflowSteps: WorkflowStep[] = [searchStep, summarizeStep, reportStep, notifyStep];
