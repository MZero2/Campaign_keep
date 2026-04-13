import { createSessionAction } from "@/app/campaigns/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type SessionsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const sessionErrorMap: Record<string, string> = {
  invalid: "Dati sessione non validi.",
  invalid_date: "Data sessione non valida.",
  forbidden: "Solo il master puo creare sessioni.",
};

export default async function SessionsPage({ params, searchParams }: SessionsPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);
  const isMaster = access.isMaster;
  const resolvedSearchParams = await searchParams;
  const error =
    typeof resolvedSearchParams.error === "string" ? sessionErrorMap[resolvedSearchParams.error] : null;

  const sessions = await prisma.campaignSession.findMany({
    where: { campaignId: access.campaign.id },
    orderBy: [{ number: "desc" }],
    include: {
      createdBy: {
        select: { displayName: true },
      },
    },
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Recap pubblici per il party e note private per il master.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-neutral-400">No sessions logged yet.</p>
          ) : (
            sessions.map((session) => (
              <article key={session.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-neutral-100">
                    #{session.number} - {session.title}
                  </h3>
                  <p className="text-xs text-neutral-500">{formatDate(session.playedAt)}</p>
                </div>
                <p className="text-sm text-neutral-300">{session.publicRecap || "No public recap yet."}</p>
                {isMaster && session.privateNotes ? (
                  <div className="mt-3 rounded-md border border-amber-400/20 bg-amber-400/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-amber-300/80">Master Notes</p>
                    <p className="text-sm text-neutral-300">{session.privateNotes}</p>
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-neutral-500">Created by {session.createdBy.displayName}</p>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Session</CardTitle>
          <CardDescription>{isMaster ? "Registra nuova sessione." : "Solo il master puo creare sessioni."}</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="mb-3 rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          {isMaster ? (
            <form action={createSessionAction.bind(null, slug)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Session 2 - Beneath the Chapel" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playedAt">Date</Label>
                <Input id="playedAt" name="playedAt" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicRecap">Public Recap</Label>
                <Textarea id="publicRecap" name="publicRecap" className="min-h-24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privateNotes">Private Master Notes</Label>
                <Textarea id="privateNotes" name="privateNotes" className="min-h-24" />
              </div>
              <Button type="submit">Create Session</Button>
            </form>
          ) : (
            <p className="text-sm text-neutral-400">I giocatori possono consultare i recap pubblici.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
