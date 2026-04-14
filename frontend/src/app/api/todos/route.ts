import { NextResponse } from "next/server";
import { ApiError, serverFetch } from "@/lib/api";
import { createTodoSchema, todoListSchema, todoSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const todos = await serverFetch("/api/todos", { schema: todoListSchema });
    return NextResponse.json({ success: true, data: todos, error: null });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON" },
      { status: 400 },
    );
  }
  const parsed = createTodoSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: parsed.error.issues[0]?.message ?? "validation failed" },
      { status: 400 },
    );
  }
  try {
    const created = await serverFetch("/api/todos", {
      method: "POST",
      body: parsed.data,
      schema: todoSchema,
    });
    return NextResponse.json({ success: true, data: created, error: null }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}

function errorResponse(e: unknown) {
  const status = e instanceof ApiError ? e.status : 500;
  const message = e instanceof Error ? e.message : "unknown error";
  return NextResponse.json(
    { success: false, data: null, error: message },
    { status: status === 0 ? 500 : status },
  );
}
