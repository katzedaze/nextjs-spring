"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "../actions";
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

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          <CardDescription>メールとパスワードを入力してください。</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">メール</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            {state.error ? (
              <p className="text-sm text-[var(--color-destructive)]">{state.error}</p>
            ) : null}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Link href="/register" className="text-sm underline">
              新規登録
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? "送信中..." : "ログイン"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
