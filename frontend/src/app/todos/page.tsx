import { listTodos, createTodoAction } from "./actions";
import { TodoItem } from "@/components/todos/todo-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "../(auth)/actions";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const todos = await listTodos();
  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">TODO</h1>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            ログアウト
          </Button>
        </form>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>新規追加</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTodoAction} className="flex gap-2">
            <Input name="title" placeholder="やること..." required maxLength={255} />
            <Button type="submit">追加</Button>
          </form>
        </CardContent>
      </Card>

      <ul className="flex flex-col gap-2">
        {todos.length === 0 ? (
          <li className="text-sm text-[var(--color-muted-foreground)]">TODO はありません。</li>
        ) : (
          todos.map((t) => <TodoItem key={t.id} todo={t} />)
        )}
      </ul>
    </main>
  );
}
