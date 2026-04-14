"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { clientApi } from "@/lib/client-api";
import { createTodoSchema, type Todo } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TODOS_KEY = ["todos"] as const;

export function TodosView() {
  const qc = useQueryClient();
  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: TODOS_KEY,
    queryFn: clientApi.listTodos,
  });

  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: clientApi.createTodo,
    onSuccess: () => {
      setTitle("");
      setFormError(null);
      qc.invalidateQueries({ queryKey: TODOS_KEY });
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : "作成に失敗しました"),
  });

  const updateMutation = useMutation({
    mutationFn: clientApi.updateTodo,
    onMutate: async ({ id, ...patch }) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const previous = qc.getQueryData<Todo[]>(TODOS_KEY);
      if (previous) {
        qc.setQueryData<Todo[]>(
          TODOS_KEY,
          previous.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(TODOS_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: clientApi.deleteTodo,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const previous = qc.getQueryData<Todo[]>(TODOS_KEY);
      if (previous) {
        qc.setQueryData<Todo[]>(
          TODOS_KEY,
          previous.filter((t) => t.id !== id),
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(TODOS_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createTodoSchema.safeParse({ title });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "入力エラー");
      return;
    }
    createMutation.mutate(parsed.data);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>新規追加</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              name="title"
              placeholder="やること..."
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createMutation.isPending}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "追加中..." : "追加"}
            </Button>
          </form>
          {formError ? (
            <p className="mt-2 text-sm text-[var(--color-destructive)]">{formError}</p>
          ) : null}
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">読み込み中...</p>
      ) : error ? (
        <p className="text-sm text-[var(--color-destructive)]">
          取得に失敗しました: {error instanceof Error ? error.message : "unknown"}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.length === 0 ? (
            <li className="text-sm text-[var(--color-muted-foreground)]">TODO はありません。</li>
          ) : (
            todos.map((t) => (
              <Card key={t.id} className="flex items-center gap-3 p-3">
                <Checkbox
                  checked={t.done}
                  onChange={(e) => updateMutation.mutate({ id: t.id, done: e.target.checked })}
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    t.done && "text-[var(--color-muted-foreground)] line-through",
                  )}
                >
                  {t.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="削除"
                  onClick={() => deleteMutation.mutate(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))
          )}
        </ul>
      )}
    </>
  );
}
