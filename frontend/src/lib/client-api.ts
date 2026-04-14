import { z } from "zod";
import {
  apiEnvelope,
  createTodoSchema,
  todoListSchema,
  todoSchema,
  updateTodoSchema,
  type CreateTodoInput,
  type Todo,
  type UpdateTodoInput,
} from "./schemas";

async function request<T extends z.ZodTypeAny>(
  path: string,
  init: RequestInit,
  schema: T,
): Promise<z.infer<T>> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : {};
  const parsed = apiEnvelope(schema).safeParse(json);
  if (!parsed.success) {
    throw new Error(`Invalid response: ${parsed.error.issues[0]?.message ?? "unknown"}`);
  }
  if (!res.ok || !parsed.data.success) {
    throw new Error(parsed.data.error ?? `Request failed: ${res.status}`);
  }
  return (parsed.data.data ?? null) as z.infer<T>;
}

export const clientApi = {
  listTodos: (): Promise<Todo[]> => request("/api/todos", { method: "GET" }, todoListSchema),
  createTodo: (input: CreateTodoInput): Promise<Todo> =>
    request(
      "/api/todos",
      { method: "POST", body: JSON.stringify(createTodoSchema.parse(input)) },
      todoSchema,
    ),
  updateTodo: ({ id, ...patch }: { id: string } & UpdateTodoInput): Promise<Todo> =>
    request(
      `/api/todos/${id}`,
      { method: "PATCH", body: JSON.stringify(updateTodoSchema.parse(patch)) },
      todoSchema,
    ),
  deleteTodo: (id: string): Promise<null> =>
    request(`/api/todos/${id}`, { method: "DELETE" }, z.null()),
};
