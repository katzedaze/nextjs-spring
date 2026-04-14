import { z } from "zod";
import {
  apiEnvelope,
  todoListSchema,
  todoSchema,
  type CreateTodoInput,
  type Todo,
  type UpdateTodoInput,
} from "./schemas";

async function request<T extends z.ZodTypeAny>(
  path: string,
  init: RequestInit,
  schema: T,
): Promise<z.infer<T> | null> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (res.status === 204) return null;
  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : {};
  const parsed = apiEnvelope(schema).safeParse(json);
  if (!parsed.success) {
    throw new Error(`Invalid response: ${parsed.error.issues[0]?.message ?? "unknown"}`);
  }
  if (!res.ok || !parsed.data.success) {
    throw new Error(parsed.data.error ?? `Request failed: ${res.status}`);
  }
  return parsed.data.data ?? null;
}

export const clientApi = {
  listTodos: async (): Promise<Todo[]> =>
    (await request("/api/todos", { method: "GET" }, todoListSchema)) ?? [],
  createTodo: async (input: CreateTodoInput): Promise<Todo> => {
    const result = await request(
      "/api/todos",
      { method: "POST", body: JSON.stringify(input) },
      todoSchema,
    );
    if (!result) throw new Error("Empty create response");
    return result;
  },
  updateTodo: async ({ id, ...patch }: { id: string } & UpdateTodoInput): Promise<Todo> => {
    const result = await request(
      `/api/todos/${id}`,
      { method: "PATCH", body: JSON.stringify(patch) },
      todoSchema,
    );
    if (!result) throw new Error("Empty update response");
    return result;
  },
  deleteTodo: (id: string): Promise<null> =>
    request(`/api/todos/${id}`, { method: "DELETE" }, z.null()).then(() => null),
};
