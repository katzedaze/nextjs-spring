import { TodosView } from "@/components/todos/todos-view";
import { Button } from "@/components/ui/button";
import { logoutAction } from "../(auth)/actions";

export const dynamic = "force-dynamic";

export default function TodosPage() {
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
      <TodosView />
    </main>
  );
}
