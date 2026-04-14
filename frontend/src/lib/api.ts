import { cookies } from "next/headers";

export const TOKEN_COOKIE = "todo_token";

const internalBase = () =>
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

type ApiEnvelope<T> = { success: boolean; data: T | null; error: string | null };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function serverFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = init;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Content-Type", "application/json");
  if (auth) {
    const token = (await cookies()).get(TOKEN_COOKIE)?.value;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${internalBase()}${path}`, {
    ...rest,
    headers: finalHeaders,
    cache: "no-store",
  });
  const text = await res.text();
  const envelope: ApiEnvelope<T> = text
    ? JSON.parse(text)
    : { success: false, data: null, error: "empty" };
  if (!res.ok || !envelope.success) {
    throw new ApiError(envelope.error ?? `Request failed: ${res.status}`, res.status);
  }
  return envelope.data as T;
}
