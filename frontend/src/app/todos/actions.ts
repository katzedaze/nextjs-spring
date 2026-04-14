"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api";

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listTodos(): Promise<Todo[]> {
  return serverFetch<Todo[]>("/api/todos", { method: "GET" });
}

export async function createTodoAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await serverFetch<Todo>("/api/todos", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  revalidatePath("/todos");
}

export async function toggleTodoAction(id: string, done: boolean) {
  await serverFetch<Todo>(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ done }),
  });
  revalidatePath("/todos");
}

export async function deleteTodoAction(id: string) {
  await serverFetch<null>(`/api/todos/${id}`, { method: "DELETE" });
  revalidatePath("/todos");
}
