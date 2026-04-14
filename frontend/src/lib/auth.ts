import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "./api";

const MAX_AGE_SECONDS = 60 * 60;

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}

export async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return Boolean(store.get(TOKEN_COOKIE)?.value);
}
