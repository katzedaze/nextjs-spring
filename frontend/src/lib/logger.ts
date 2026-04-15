import pino from "pino";

function defaultLevel(): string {
  const env = process.env.APP_ENV;
  if (env === "prd") return "warn";
  if (env === "stg") return "info";
  if (env === "dev") return "debug";
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

export const log = pino({
  level: process.env.LOG_LEVEL ?? defaultLevel(),
  base: { service: "todo-frontend" },
  redact: ["password", "token", "authorization", "cookie", "*.password", "*.token"],
});
