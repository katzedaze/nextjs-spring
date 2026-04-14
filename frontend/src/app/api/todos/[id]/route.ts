import { NextResponse } from "next/server";
import { z } from "zod";
import { serverFetch } from "@/lib/api";
import { todoSchema, updateTodoSchema } from "@/lib/schemas";
import { badRequest, errorResponse } from "@/lib/route-helpers";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const paramsCheck = paramsSchema.safeParse(await context.params);
  if (!paramsCheck.success) return badRequest("invalid id");

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest("invalid JSON");
  }
  const parsed = updateTodoSchema.safeParse(rawBody);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "validation failed");
  }
  try {
    const updated = await serverFetch(`/api/todos/${paramsCheck.data.id}`, {
      method: "PATCH",
      body: parsed.data,
      schema: todoSchema,
    });
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const paramsCheck = paramsSchema.safeParse(await context.params);
  if (!paramsCheck.success) return badRequest("invalid id");
  try {
    await serverFetch(`/api/todos/${paramsCheck.data.id}`, {
      method: "DELETE",
      schema: z.null(),
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
