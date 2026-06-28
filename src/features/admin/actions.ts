"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function adminGuard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, user, isAdmin: me?.role === "admin" };
}

/** 단일 태스크 삭제(관리자). tasks DELETE admin override 사용. */
export async function deleteTask(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase, isAdmin } = await adminGuard();
  if (!isAdmin) return;
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) console.error("deleteTask failed", { code: error.code });
  revalidatePath("/admin");
}

/** 사용자 완전 삭제(관리자). RPC admin_delete_user → 그 사용자가 만든 태스크·계정까지 삭제. */
export async function deleteUser(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase, user, isAdmin } = await adminGuard();
  if (!isAdmin || !user) return;
  if (id === user.id) return; // 자기 자신 삭제 금지(RPC도 차단)
  const { error } = await supabase.rpc("admin_delete_user", { target: id });
  if (error) console.error("deleteUser failed", { message: error.message });
  revalidatePath("/admin");
}
