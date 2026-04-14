import { NextResponse } from "next/server";
import { ApiError } from "./api";

export function badRequest(message: string) {
  return NextResponse.json({ success: false, data: null, error: message }, { status: 400 });
}

export function errorResponse(e: unknown) {
  const status = e instanceof ApiError ? e.status : 500;
  const message = e instanceof Error ? e.message : "unknown error";
  return NextResponse.json(
    { success: false, data: null, error: message },
    { status: status === 0 ? 500 : status },
  );
}
