import { LogoutButton } from "@/components/logout-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await requireSessionUser();
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      displayName: true,
      email: true,
      createdAt: true,
      masterPlanActive: true,
    },
  });

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Profilo utente e sessione.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-neutral-300">
          <p>
            <span className="text-neutral-500">Display Name:</span> {user.displayName}
          </p>
          <p>
            <span className="text-neutral-500">Email:</span> {user.email}
          </p>
          <p>
            <span className="text-neutral-500">Member since:</span> {formatDate(user.createdAt)}
          </p>
          <p>
            <span className="text-neutral-500">Master Plan:</span>{" "}
            {user.masterPlanActive ? "Active" : "Inactive"}
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}
