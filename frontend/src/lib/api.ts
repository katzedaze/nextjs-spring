import { cookies } from "next/headers";
import { z } from "zod";
import { apiEnvelope } from "./schemas";

export const TOKEN_COOKIE = "todo_token";

const internalBase = () =>
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type FetchOptions<T extends z.ZodTypeAny> = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: unknown;
  schema: T;
};

export async function serverFetch<T extends z.ZodTypeAny>(
  path: string,
  options: FetchOptions<T>,
): Promise<z.infer<T>> {
  const { auth = true, schema, body, headers, method = "GET", ...rest } = options;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Content-Type", "application/json");
  if (auth) {
    const token = (await cookies()).get(TOKEN_COOKIE)?.value;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${internalBase()}${path}`, {
    ...rest,
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  const json: unknown = text
    ? JSON.parse(text)
    : { success: false, data: null, error: "empty response" };
  const envelope = apiEnvelope(schema).safeParse(json);
  if (!envelope.success) {
    throw new ApiError(`Invalid API response: ${envelope.error.message}`, res.status);
  }
  if (!res.ok || !envelope.data.success) {
    throw new ApiError(envelope.data.error ?? `Request failed: ${res.status}`, res.status);
  }
  return (envelope.data.data ?? null) as z.infer<T>;
}
