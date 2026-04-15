import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "./api";

const MAX_AGE_SECONDS = 60 * 60;

/**
 * Decide whether to set the cookie's `Secure` flag.
 *
 * Defaults to `true` so that staging/preview environments with HTTPS still get
 * a Secure cookie. Explicitly opt out via `COOKIE_INSECURE=1` for local HTTP
 * development only.
 */
function shouldMarkSecure(): boolean {
  // COOKIE_INSECURE is honored only in DEV. STG/PRD always set Secure.
  if (process.env.APP_ENV && process.env.APP_ENV !== "dev") return true;
  return process.env.COOKIE_INSECURE !== "1";
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: shouldMarkSecure(),
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
