import { z } from "zod";

const isoDateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください");

export const todoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  done: z.boolean(),
  dueDate: isoDateOnly.nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const todoListSchema = z.array(todoSchema);

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, "必須です").max(255),
  description: z.string().max(10_000).optional(),
  dueDate: isoDateOnly.optional(),
});

export const updateTodoSchema = createTodoSchema.partial().extend({
  done: z.boolean().optional(),
});

export const userViewSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
});

export const authResponseSchema = z.object({
  token: z.string().min(1),
  user: userViewSchema,
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  displayName: z.string().trim().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Envelope matches the backend's @JsonInclude(NON_NULL): absent fields are
// modelled as optional rather than coerced to null.
export function apiEnvelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    success: z.boolean(),
    data: data.optional(),
    error: z.string().optional(),
    meta: z.object({ total: z.number(), page: z.number(), size: z.number() }).optional(),
  });
}

export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type UserView = z.infer<typeof userViewSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
