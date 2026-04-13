import Link from "next/link";
import { CampaignRole } from "@prisma/client";

import { createCampaignAction, joinCampaignAction } from "@/app/dashboard/actions";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const dashboardErrorMap: Record<string, string> = {
  invalid_campaign_input: "Titolo o descrizione campagna non validi.",
  invalid_invite_token: "Formato token invito non valido.",
  invite_not_found: "Invito non trovato o gia usato.",
  invite_email_mismatch: "Questo invito e associato a un'altra email.",
  master_plan_required: "Per creare una campagna serve un Master Plan attivo.",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const sessionUser = await requireSessionUser();
  const currentUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
      masterPlanActive: true,
    },
  });

  if (!currentUser) {
    return null;
  }

  const [memberships, characters, invitations, recentSessions] = await Promise.all([
    prisma.campaignMember.findMany({
      where: { userId: currentUser.id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.character.findMany({
      where: { ownerUserId: currentUser.id },
      select: {
        id: true,
        name: true,
        level: true,
        className: true,
        campaign: { select: { slug: true, title: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.campaignInvite.findMany({
      where: {
        acceptedAt: null,
        expiresAt: { gt: new Date() },
        OR: [{ email: null }, { email: { equals: currentUser.email, mode: "insensitive" } }],
      },
      include: {
        campaign: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.campaignSession.findMany({
      where: {
        campaign: {
          members: {
            some: { userId: currentUser.id },
          },
        },
      },
      select: {
        id: true,
        title: true,
        playedAt: true,
        campaign: { select: { title: true, slug: true } },
      },
      orderBy: { playedAt: "desc" },
      take: 6,
    }),
  ]);

  const masterCampaignCount = memberships.filter((member) => member.role === CampaignRole.MASTER).length;
  const playerCampaignCount = memberships.filter((member) => member.role === CampaignRole.PLAYER).length;
  const resolvedSearchParams = await searchParams;
  const dashboardError =
    typeof resolvedSearchParams.error === "string" ? dashboardErrorMap[resolvedSearchParams.error] : null;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="app-frame rounded-2xl px-6 py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-amber-200/80">Bentornato</p>
            <h1 className="font-heading text-3xl text-neutral-100">{currentUser.displayName}</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Ruoli per campagna: puoi essere master in una e player in un altra.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm">
              Landing
            </Link>
            <LogoutButton />
          </div>
        </div>
      </section>

      {dashboardError ? (
        <p className="rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {dashboardError}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Active Campaigns</CardDescription>
            <CardTitle>{memberships.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Master Roles</CardDescription>
            <CardTitle>{masterCampaignCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Player Roles</CardDescription>
            <CardTitle>{playerCampaignCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Master Plan</CardDescription>
            <CardTitle>{currentUser.masterPlanActive ? "Active" : "Inactive"}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Campaign</CardTitle>
            <CardDescription>Nuova campagna D&D con spazio master/player pronto.</CardDescription>
          </CardHeader>
          <CardContent>
            {currentUser.masterPlanActive ? (
              <form action={createCampaignAction} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="Chronicles of Ravenfall" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief campaign summary..."
                    minLength={10}
                    required
                  />
                </div>
                <Button type="submit">Create Campaign</Button>
              </form>
            ) : (
              <p className="rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
                Master Plan non attivo: puoi entrare nelle campagne come player, ma non crearne di nuove.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join Campaign</CardTitle>
            <CardDescription>Inserisci un token invito ricevuto dal master.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={joinCampaignAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="token">Invite Token</Label>
                <Input id="token" name="token" placeholder="EMBER-OPEN-SEAT" required />
              </div>
              <Button type="submit" variant="secondary">
                Join Campaign
              </Button>
            </form>
            <p className="mt-4 text-xs text-neutral-500">Demo token seed: `EMBER-OPEN-SEAT`</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>My Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {memberships.length === 0 ? (
              <p className="text-sm text-neutral-400">Nessuna campagna ancora. Unisciti a una campagna per iniziare.</p>
            ) : (
              memberships.map((membership) => (
                <article key={membership.id} className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-100">{membership.campaign.title}</h3>
                      <p className="text-sm text-neutral-400">{membership.campaign.description}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-amber-200/80">
                        role: {membership.role}
                      </p>
                    </div>
                    <Link
                      href={`/campaigns/${membership.campaign.slug}`}
                      className="inline-flex h-9 items-center rounded-md bg-amber-500 px-3 text-sm font-medium text-neutral-950 hover:bg-amber-400"
                    >
                      Open
                    </Link>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invitations.length === 0 ? (
              <p className="text-sm text-neutral-400">Nessun invito pendente.</p>
            ) : (
              invitations.map((invite) => (
                <div key={invite.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                  <p className="text-sm text-neutral-100">{invite.campaign.title}</p>
                  <p className="text-xs text-neutral-400">Token: {invite.token}</p>
                  <p className="text-xs text-neutral-500">Scade: {formatDate(invite.expiresAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Characters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {characters.length === 0 ? (
              <p className="text-sm text-neutral-400">Non hai ancora personaggi.</p>
            ) : (
              characters.map((character) => (
                <div key={character.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                  <p className="text-sm font-medium text-neutral-100">{character.name}</p>
                  <p className="text-xs text-neutral-400">
                    Lv. {character.level} {character.className ?? "Adventurer"} - {character.campaign.title}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSessions.length === 0 ? (
              <p className="text-sm text-neutral-400">Nessuna sessione registrata.</p>
            ) : (
              recentSessions.map((session) => (
                <div key={session.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                  <p className="text-sm text-neutral-100">{session.title}</p>
                  <p className="text-xs text-neutral-400">
                    {session.campaign.title} - {formatDate(session.playedAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
