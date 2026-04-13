import Link from "next/link";

import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSessionUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMap: Record<string, string> = {
  invalid_input: "Controlla i campi inseriti.",
  invalid_credentials: "Email o password non validi.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSessionUser();
  if (session) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sei già autenticato</CardTitle>
            <CardDescription>Continua sulla tua dashboard campagne.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-md bg-amber-500 px-4 font-medium text-neutral-950 hover:bg-amber-400"
            >
              Apri Dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const resolved = await searchParams;
  const error = typeof resolved.error === "string" ? errorMap[resolved.error] : null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Login</CardTitle>
          <CardDescription>Accedi al tuo spazio campagna.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            {error ? (
              <p className="rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Enter Campaign Keep
            </Button>
          </form>

          <p className="mt-4 text-sm text-neutral-400">
            Non hai un account?{" "}
            <Link href="/register" className="text-amber-300 hover:text-amber-200">
              Registrati
            </Link>
          </p>
          <p className="mt-3 text-xs text-neutral-500">
            Demo: `master@campaignkeep.dev` / `demo1234`
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
