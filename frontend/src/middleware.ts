import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_COOKIE = "todo_token";

const appEnv = process.env.APP_ENV ?? process.env.NEXT_PUBLIC_APP_ENV ?? "dev";
const isDev = appEnv === "dev";

const secretEnv = process.env.APP_JWT_SECRET ?? process.env.NEXT_PUBLIC_APP_JWT_SECRET ?? "";
const SECRET_KEY = secretEnv ? new TextEncoder().encode(secretEnv) : null;

async function isValid(token: string): Promise<boolean> {
  if (!SECRET_KEY) {
    // Fail closed in non-dev environments — never trust cookie presence alone.
    if (!isDev) return false;
    return Boolean(token);
  }
  try {
    await jwtVerify(token, SECRET_KEY);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token || !(await isValid(token))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    if (token) response.cookies.delete(TOKEN_COOKIE);
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/todos/:path*"],
};
