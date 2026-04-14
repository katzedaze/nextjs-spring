import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api";
import { createTodoSchema, todoListSchema, todoSchema } from "@/lib/schemas";
import { badRequest, errorResponse } from "@/lib/route-helpers";

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
    return badRequest("Invalid JSON");
  }
  const parsed = createTodoSchema.safeParse(rawBody);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "validation failed");
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
