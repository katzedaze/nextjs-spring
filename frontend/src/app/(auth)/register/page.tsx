"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(registerAction, {});
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>新規登録</CardTitle>
          <CardDescription>アカウントを作成します。</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input id="displayName" name="displayName" required maxLength={100} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">メール</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">パスワード (8文字以上)</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            {state.error ? (
              <p className="text-sm text-[var(--color-destructive)]">{state.error}</p>
            ) : null}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Link href="/login" className="text-sm underline">
              ログインへ戻る
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? "送信中..." : "登録"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
