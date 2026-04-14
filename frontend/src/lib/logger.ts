import pino from "pino";

/**
 * Server-side logger. Use `log.info` / `log.warn` / `log.error` in route
 * handlers and server actions — do NOT import this in client components
 * (pino is a Node-only module).
 */
export const log = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  base: { service: "todo-frontend" },
  redact: ["password", "token", "authorization", "cookie", "*.password", "*.token"],
});
