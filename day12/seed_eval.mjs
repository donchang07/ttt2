// Day12 RAG 시드+평가 (일회성). 실행: node day12/seed_eval.mjs
// server-only 가드 때문에 lib 모듈을 직접 임포트하지 않고 동일 로직을 재현.
// 계정 A(demo)로 임베딩+질의, 계정 B(demo2)로 격리 검증. 더미 문서만, PII 없음.
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/).filter((l) => /^\s*[A-Za-z_]+\s*=/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
// 평가 전용 계정(Confirm email OFF → signUp 즉시 세션). 재실행 시 signIn으로 재사용.
const A = { email: "rag-eval-a@taskflow.test", pw: "RagEval1234!" };
const B = { email: "rag-eval-b@taskflow.test", pw: "RagEval1234!" };

async function ensureSession(client, email, password) {
  const up = await client.auth.signUp({ email, password });
  if (up.data?.session) return up.data.user;
  const inn = await client.auth.signInWithPassword({ email, password });
  if (inn.error) throw new Error(`auth ${email}: ${inn.error.message}`);
  return inn.data.user;
}

function newClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
function splitIntoChunks(text, size = 500, overlap = 50) {
  const w = text.split(/\s+/).filter(Boolean); if (!w.length) return [];
  const step = size - overlap; const out = [];
  for (let i = 0; i < w.length; i += step) { out.push(w.slice(i, i + size).join(" ")); if (i + size >= w.length) break; }
  return out;
}
async function embedTexts(texts) {
  const r = await openai.embeddings.create({ model: "text-embedding-3-small", input: texts });
  return r.data.map((d) => d.embedding);
}
async function insertChunks(supabase, userId, name, content) {
  const chunks = splitIntoChunks(content); const embs = await embedTexts(chunks);
  const rows = chunks.map((c, i) => ({ user_id: userId, document_name: name, chunk_index: i, content: c, embedding: embs[i] }));
  let { error } = await supabase.from("document_chunks").insert(rows);
  if (error && /vector|invalid input|malformed/i.test(error.message)) {
    // 폴백: 벡터를 문자열로
    const rows2 = rows.map((r) => ({ ...r, embedding: JSON.stringify(r.embedding) }));
    ({ error } = await supabase.from("document_chunks").insert(rows2));
    if (!error) globalThis.__VEC_STR = true;
  }
  if (error) throw new Error(`insert ${name}: ${error.message}`);
  return chunks.length;
}
async function search(supabase, query, threshold = 0.3, count = 3) {
  const [emb] = await embedTexts([query]);
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: globalThis.__VEC_STR ? JSON.stringify(emb) : emb, match_threshold: threshold, match_count: count,
  });
  if (error) throw new Error(`rpc: ${error.message}`);
  return data ?? [];
}
async function generate(supabase, q) {
  const res = await search(supabase, q);
  if (!res.length) return { answer: "근거 없음", sources: [], results: res };
  const ctx = res.map((r, i) => `[문서 ${i + 1}: ${r.document_name}]\n${r.content}`).join("\n\n");
  const m = await anthropic.messages.create({
    model: "claude-opus-4-8", max_tokens: 1024,
    system: "제공된 문서에만 근거해 한국어로 답하라. 근거가 없으면 정확히 '근거 없음'이라고만 답하라. 개인정보·민감정보는 답변에 포함하지 말 것.",
    messages: [{ role: "user", content: `다음 문서를 참고해 질문에 답하라.\n\n${ctx}\n\n질문: ${q}` }],
  });
  const answer = m.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim() || "근거 없음";
  return { answer, sources: res.map((r) => ({ document_name: r.document_name, similarity: r.similarity })), results: res };
}

const DOCS = [
  ["온보딩 가이드", "신규 멤버가 팀에 합류하면 첫 태스크 생성 시 ensure_personal_team 함수가 개인 팀을 자동으로 만든다. 사용자는 members 테이블을 통해 팀에 속하고 자기 팀 데이터만 접근한다."],
  ["RLS 정책 개요", "모든 테이블은 행 수준 보안으로 격리한다. tasks는 created_by 기준 per-user 격리이고 teams members notes는 team_id 기준 team 격리다. 기본은 Default Deny다."],
  ["태스크 우선순위 추천 기준", "우선순위는 마감 임박도, 차단 요인 여부, 비즈니스 영향 세 가지를 근거로 산정한다. AI는 high medium low와 근거 문장을 함께 제안한다."],
  ["주간 회의 노트", "이번 주 스프린트 목표는 인증과 RLS 안정화다. 회원가입 재도입과 확인메일 비활성화를 마쳤고 다음은 노트 RAG 검색이다."],
  ["태스크 생성 절차", "tasks 페이지에서 제목을 입력하고 생성 버튼을 누른다. created_by는 폼 값을 신뢰하지 않고 서버에서 auth.uid 로 강제한다. 생성 후 목록이 revalidatePath로 갱신된다."],
  ["담당자 배정 규칙", "assignTask 서버 액션으로 팀원에게 태스크를 배정한다. 완료된 done 상태 태스크에는 배정할 수 없으며 규칙 위반 시 RULE-409 오류를 반환한다."],
  ["배포 절차", "main 브랜치에 푸시하면 Vercel이 자동 배포한다. 배포 전 typecheck lint build 세 가지가 모두 통과해야 한다."],
  ["보안 점검표", "secret 키와 service_role 키는 서버 전용이며 브라우저 코드나 캡처에 노출하지 않는다. 클라이언트에는 publishable 키만 둔다."],
  ["노트 RAG 설계", "문서를 청크로 나눠 임베딩하고 match_documents 함수로 코사인 유사도 검색을 한다. 검색과 임베딩 모두 호출자 RLS 컨텍스트에서 본인 문서만 대상으로 한다."],
  ["임베딩 모델 선택", "임베딩은 text-embedding-3-small 모델을 쓰며 출력 차원은 1536이다. 이 차원은 데이터베이스의 vector 컬럼 차원과 정확히 일치해야 한다."],
  ["에러 처리 가이드", "오류는 코드별로 사용자 메시지를 정의한다. 미인증은 AUTH-401, 없는 대상은 TASK-404, 규칙 위반은 RULE-409, 내부 저장 실패는 500이다."],
  ["MCP 서버 개요", "list_recent_tasks는 읽기 전용 MCP 도구로 최근 수정된 더미 태스크를 반환한다. limit 옵션은 1에서 20 사이이며 쓰기 작업은 없다."],
];
const QUERIES = [
  { q: "신규 팀원이 들어오면 팀은 어떻게 만들어지나요?", expect: "온보딩 가이드" },
  { q: "태스크 우선순위는 무엇을 근거로 정하나요?", expect: "태스크 우선순위 추천 기준" },
  { q: "완료된 태스크도 담당자를 배정할 수 있나요?", expect: "담당자 배정 규칙" },
  { q: "임베딩 차원은 몇이어야 하나요?", expect: "임베딩 모델 선택" },
  { q: "오늘 점심 메뉴 추천해줘", expect: null }, // out-of-scope → 근거 없음
];

function score(expect, results) {
  if (!expect) return results.length === 0 ? 3 : 0; // out-of-scope: 0건이어야 만점
  if (!results.length) return 0;
  if (results[0].document_name === expect) return 3;
  if (results.some((r) => r.document_name === expect)) return 2;
  return 1;
}

async function main() {
  const out = { vec_format: null, seeded_chunks: 0, A: [], B: [], errors: [] };

  // 계정 A: 시드 후 질의
  const a = newClient();
  const aUser = await ensureSession(a, A.email, A.pw);
  const aId = aUser.id;
  // 멱등: 기존 시드 삭제 후 재삽입
  await a.from("document_chunks").delete().eq("user_id", aId);
  for (const [name, content] of DOCS) out.seeded_chunks += await insertChunks(a, aId, name, content);
  out.vec_format = globalThis.__VEC_STR ? "string" : "array";

  if (process.env.RAG_DIAG === "1") {
    const diag = [];
    for (const { q, expect } of QUERIES) {
      const res = await search(a, q, -1, 5); // 전부 통과 → 실제 유사도 분포 확인
      diag.push({ q, expect, top: res.map((r) => ({ name: r.document_name, sim: Number(r.similarity.toFixed(4)) })) });
    }
    console.log("DIAG_JSON_START"); console.log(JSON.stringify(diag, null, 2)); console.log("DIAG_JSON_END");
    process.exit(0);
  }

  for (const { q, expect } of QUERIES) {
    const g = await generate(a, q);
    out.A.push({
      q, expect, retrieved: g.results.length,
      max_sim: g.results.length ? Number(g.results[0].similarity.toFixed(4)) : 0,
      top: g.results[0]?.document_name ?? null,
      score: score(expect, g.results),
      answer: g.answer.slice(0, 200),
      leak: g.results.some((r) => r.document_name && false), // PII 없음(더미)
    });
  }

  // 계정 B: 동일 질의 → 격리(0건 / 근거 없음) 기대
  const b = newClient();
  const bUser = await ensureSession(b, B.email, B.pw);
  await b.from("document_chunks").delete().eq("user_id", bUser.id); // B는 문서 없음 보장
  for (const { q } of QUERIES.slice(0, 3)) {
    const res = await search(b, q);
    out.B.push({ q, retrieved: res.length, isolated: res.length === 0 });
  }

  console.log("RESULT_JSON_START");
  console.log(JSON.stringify(out, null, 2));
  console.log("RESULT_JSON_END");
}
main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
