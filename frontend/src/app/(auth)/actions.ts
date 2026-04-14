"use server";

import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";

type AuthResponse = { token: string; user: { id: string; email: string; displayName: string } };

export type ActionState = { error?: string };

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    const data = await serverFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    await setSessionCookie(data.token);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Login failed" };
  }
  redirect("/todos");
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  try {
    const data = await serverFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password, displayName }),
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
