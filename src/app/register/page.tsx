import Link from "next/link";

import { registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMap: Record<string, string> = {
  invalid_input: "Compila tutti i campi in modo valido.",
  email_taken: "Questa email è già in uso.",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolved = await searchParams;
  const error = typeof resolved.error === "string" ? errorMap[resolved.error] : null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Create Account</CardTitle>
          <CardDescription>Apri il tuo spazio in Campaign Keep.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            {error ? (
              <p className="rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-sm text-neutral-400">
            Hai già un account?{" "}
            <Link href="/login" className="text-amber-300 hover:text-amber-200">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
