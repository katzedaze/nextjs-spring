"use server";

import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { authResponseSchema, loginSchema, registerSchema } from "@/lib/schemas";

export type ActionState = { error?: string };

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力エラー" };
  }
  try {
    const data = await serverFetch("/api/auth/login", {
      method: "POST",
      auth: false,
      body: parsed.data,
      schema: authResponseSchema,
    });
    await setSessionCookie(data.token);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Login failed" };
  }
  redirect("/todos");
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力エラー" };
  }
  try {
    const data = await serverFetch("/api/auth/register", {
      method: "POST",
      auth: false,
      body: parsed.data,
      schema: authResponseSchema,
    });
    await setSessionCookie(data.token);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Register failed" };
  }
  redirect("/todos");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
