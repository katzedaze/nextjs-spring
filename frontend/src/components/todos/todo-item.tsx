"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTodoAction, toggleTodoAction, type Todo } from "@/app/todos/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TodoItem({ todo }: { todo: Todo }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="flex items-center gap-3 p-3">
      <Checkbox
        checked={todo.done}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          startTransition(() => toggleTodoAction(todo.id, next));
        }}
      />
      <span
        className={cn(
          "flex-1 text-sm",
          todo.done && "text-[var(--color-muted-foreground)] line-through",
        )}
      >
        {todo.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={() => startTransition(() => deleteTodoAction(todo.id))}
        aria-label="削除"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Card>
  );
}
