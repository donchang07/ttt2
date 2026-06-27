"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CreateTaskState = { ok: boolean; message: string };

export async function createTask(
  prevState: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const supabase = await createClient();

  // ① 로그인 확인 — 안 했으면 막는다
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  // ② 입력 검증 — formData를 그대로 믿지 않는다
  const title = String(formData.get("title") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium").trim();
  if (title.length < 2 || title.length > 80) {
    return { ok: false, message: "제목은 2자 이상 80자 이하로 입력하세요." };
  }

  // ③ INSERT — created_by는 서버의 user.id로 강제 (hidden input 신뢰 금지)
  const { error } = await supabase.from("tasks").insert({
    title,
    priority,
    status: "todo",
    created_by: user.id,
  });
  if (error) {
    console.error("createTask failed", { code: error.code });
    return { ok: false, message: "태스크 저장에 실패했습니다." };
  }

  // ④ 목록 화면 캐시 갱신
  revalidatePath("/tasks");
  return { ok: true, message: "태스크가 저장되었습니다." };
}

// 담당자 배정 (단순 모델 — 팀·역할 기반은 Day11). 항상 { ok, code, message } 반환(throw 금지).
type AssignTaskState = { ok: boolean; code: string; message: string };

export async function assignTask(
  prevState: AssignTaskState,
  formData: FormData,
): Promise<AssignTaskState> {
  const supabase = await createClient();
  const taskId = String(formData.get("taskId") ?? "");
  // 빈 값이면 배정 해제(null). 사용자 id 문자열이면 그 값으로 배정.
  const assignee = String(formData.get("assignee") ?? "").trim() || null;

  // [오류가이드: 미인증/세션 만료 · AUTH-401]
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, code: "AUTH-401", message: "로그인이 필요합니다." };
  }

  // [오류가이드: 대상 없음/권한 없음 · TASK-404]
  // RLS(select own)상 내 태스크가 아니면 null로 옴 → '없음'과 '권한 없음'을 한 번에 처리.
  const { data: existing } = await supabase
    .from("tasks")
    .select("id, status")
    .eq("id", taskId)
    .maybeSingle();
  if (!existing) {
    return {
      ok: false,
      code: "TASK-404",
      message: "해당 태스크를 찾을 수 없습니다. 목록을 새로고침해 주세요.",
    };
  }

  // [오류가이드: 규칙 충돌 · RULE-409] 완료된 태스크엔 배정 불가
  if (existing.status === "done") {
    return {
      ok: false,
      code: "RULE-409",
      message: "완료된 태스크에는 담당자를 배정할 수 없습니다.",
    };
  }

  // UPDATE + .select('id').maybeSingle() 로 "실제 바뀐 행"을 확인 (거짓 성공 방지)
  const { data: updated, error: dbError } = await supabase
    .from("tasks")
    .update({ assignee })
    .eq("id", taskId)
    .select("id")
    .maybeSingle();

  // [오류가이드: 내부 저장 실패 · TASK-ASSIGN-500] dbError 원문은 개발자 로그에만(사용자엔 일반 문구)
  if (dbError) {
    console.error("assignTask failed", {
      code: "TASK-ASSIGN-500",
      operation: "tasks.update.assignee",
      taskId,
      dbError: dbError.message,
    });
    return {
      ok: false,
      code: "TASK-ASSIGN-500",
      message: "일시적인 오류로 배정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  // [오류가이드: 권한 없음(0행) · TASK-404] error 없이 0행이면 RLS 차단 → 거짓 성공 방지
  if (!updated) {
    console.error("assignTask no-op", {
      code: "TASK-404",
      operation: "tasks.update.assignee",
      taskId,
    });
    return {
      ok: false,
      code: "TASK-404",
      message: "해당 태스크를 찾을 수 없습니다. 목록을 새로고침해 주세요.",
    };
  }

  revalidatePath("/tasks");
  return { ok: true, code: "OK", message: "담당자를 배정했습니다." };
}
