import { describe, expect, it } from "vitest";
import {
  apiEnvelope,
  createTodoSchema,
  loginSchema,
  registerSchema,
  todoSchema,
  updateTodoSchema,
} from "./schemas";
import { z } from "zod";

describe("todoSchema", () => {
  it("accepts a valid todo", () => {
    expect(() =>
      todoSchema.parse({
        id: "11111111-1111-4111-8111-111111111111",
        title: "x",
        description: null,
        done: false,
        dueDate: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      }),
    ).not.toThrow();
  });

  it("rejects non-uuid id", () => {
    expect(
      todoSchema.safeParse({
        id: "not-a-uuid",
        title: "x",
        description: null,
        done: false,
        dueDate: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      }).success,
    ).toBe(false);
  });
});

describe("createTodoSchema", () => {
  it("trims title and requires non-empty", () => {
    expect(createTodoSchema.safeParse({ title: "   " }).success).toBe(false);
    expect(createTodoSchema.parse({ title: "  hello  " }).title).toBe("hello");
  });

  it("rejects title over 255 chars", () => {
    expect(createTodoSchema.safeParse({ title: "a".repeat(256) }).success).toBe(false);
  });
});

describe("updateTodoSchema", () => {
  it("allows partial updates", () => {
    expect(updateTodoSchema.parse({ done: true })).toEqual({ done: true });
    expect(updateTodoSchema.parse({})).toEqual({});
  });
});

describe("registerSchema & loginSchema", () => {
  it("enforces email and password constraints", () => {
    expect(
      registerSchema.safeParse({
        email: "not-email",
        password: "short",
        displayName: "x",
      }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        email: "a@b.com",
        password: "password123",
        displayName: "Alice",
      }).success,
    ).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
});

describe("apiEnvelope factory", () => {
  const envelope = apiEnvelope(z.object({ v: z.number() }));

  it("parses success envelope", () => {
    const r = envelope.parse({ success: true, data: { v: 1 } });
    expect(r.data?.v).toBe(1);
  });

  it("parses error envelope with omitted data", () => {
    const r = envelope.parse({ success: false, error: "nope" });
    expect(r.success).toBe(false);
    expect(r.error).toBe("nope");
    expect(r.data).toBeUndefined();
  });

  it("tolerates explicit null fields (Next.js proxy emits error: null)", () => {
    const r = envelope.parse({ success: true, data: { v: 1 }, error: null });
    expect(r.error).toBeNull();
  });

  it("parses envelope with meta", () => {
    const r = envelope.parse({
      success: true,
      data: { v: 1 },
      meta: { total: 10, page: 0, size: 50 },
    });
    expect(r.meta?.total).toBe(10);
  });
});
