import { NextResponse } from "next/server";
import { ApiError } from "./api";
import { log } from "./logger";

export function badRequest(message: string) {
  return NextResponse.json({ success: false, data: null, error: message }, { status: 400 });
}

export function errorResponse(e: unknown) {
  const status = e instanceof ApiError ? e.status : 500;
  const message = e instanceof Error ? e.message : "unknown error";
  if (status >= 500) {
    log.error({ err: e }, "route handler error");
  } else {
    log.warn({ status, message }, "route handler non-2xx");
  }
  return NextResponse.json(
    { success: false, data: null, error: message },
    { status: status === 0 ? 500 : status },
  );
}
