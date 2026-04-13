import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type CampaignDashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CampaignDashboardPage({ params }: CampaignDashboardPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);
  const isMaster = access.isMaster;

  const [nextSession, lastSession, activeQuests, handouts, partyCharacters, wikiUpdates, privateDrafts] =
    await Promise.all([
      prisma.campaignSession.findFirst({
        where: {
          campaignId: access.campaign.id,
          playedAt: { gt: new Date() },
        },
        orderBy: { playedAt: "asc" },
      }),
      prisma.campaignSession.findFirst({
        where: {
          campaignId: access.campaign.id,
          playedAt: { lte: new Date() },
        },
        orderBy: { playedAt: "desc" },
      }),
      prisma.quest.findMany({
        where: {
          campaignId: access.campaign.id,
          status: "ACTIVE",
          ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.handout.findMany({
        where: {
          campaignId: access.campaign.id,
          ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.character.findMany({
        where: {
          campaignId: access.campaign.id,
          isActive: true,
          ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
        },
        select: {
          id: true,
          name: true,
          className: true,
          level: true,
          ownerUser: { select: { displayName: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.wikiPage.findMany({
        where: {
          campaignId: access.campaign.id,
          ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      isMaster
        ? prisma.wikiPage.findMany({
            where: {
              campaignId: access.campaign.id,
              visibility: "PRIVATE_MASTER",
            },
            orderBy: { updatedAt: "desc" },
            take: 4,
          })
        : Promise.resolve([]),
    ]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div
          className="h-40 border-b border-neutral-800 bg-cover bg-center"
          style={{
            backgroundImage: access.campaign.coverUrl
              ? `linear-gradient(180deg, rgba(5,7,10,0.2) 0%, rgba(5,7,10,0.88) 100%), url(${access.campaign.coverUrl})`
              : "linear-gradient(120deg, #111827 0%, #0f172a 60%, #172554 100%)",
          }}
        />
        <CardContent className="pt-5">
          <h2 className="font-heading text-2xl text-neutral-100">{access.campaign.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-neutral-300">{access.campaign.description}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
              <p className="text-xs uppercase tracking-wide text-amber-200/80">Next Session</p>
              <p className="text-sm text-neutral-100">
                {nextSession ? `${nextSession.title} · ${formatDate(nextSession.playedAt)}` : "Not scheduled"}
              </p>
            </div>
            <div className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
              <p className="text-xs uppercase tracking-wide text-amber-200/80">Last Session</p>
              <p className="text-sm text-neutral-100">
                {lastSession ? `${lastSession.title} · ${formatDate(lastSession.playedAt)}` : "No session yet"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Quests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeQuests.length === 0 ? (
              <p className="text-sm text-neutral-400">No active quests right now.</p>
            ) : (
              activeQuests.map((quest) => (
                <div key={quest.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-100">{quest.title}</p>
                    <VisibilityBadge visibility={quest.visibility} />
                  </div>
                  <p className="text-xs text-neutral-400">{quest.summary}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Wiki Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wikiUpdates.length === 0 ? (
              <p className="text-sm text-neutral-400">No wiki updates yet.</p>
            ) : (
              wikiUpdates.map((page) => (
                <Link
                  key={page.id}
                  href={`/campaigns/${slug}/wiki/${page.slug}`}
                  className="block rounded-md border border-neutral-800 bg-neutral-900/60 p-3 hover:bg-neutral-900"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-neutral-100">{page.title}</p>
                    <VisibilityBadge visibility={page.visibility} />
                  </div>
                  <p className="text-xs text-neutral-500">Updated {formatDate(page.updatedAt)}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Handouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {handouts.length === 0 ? (
              <p className="text-sm text-neutral-400">No handouts published.</p>
            ) : (
              handouts.map((handout) => (
                <div key={handout.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                  <p className="text-sm font-medium text-neutral-100">{handout.title}</p>
                  <p className="text-xs text-neutral-400">{handout.fileType}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Party Characters</CardTitle>
            <CardDescription>Visible roster for this campaign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {partyCharacters.length === 0 ? (
              <p className="text-sm text-neutral-400">No active characters.</p>
            ) : (
              partyCharacters.map((character) => (
                <div key={character.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                  <p className="text-sm text-neutral-100">{character.name}</p>
                  <p className="text-xs text-neutral-400">
                    Lv. {character.level} {character.className ?? "Adventurer"} · Owner:{" "}
                    {character.ownerUser.displayName}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {isMaster ? (
          <Card>
            <CardHeader>
              <CardTitle>Master Private Drafts</CardTitle>
              <CardDescription>Content visible only to master role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {privateDrafts.length === 0 ? (
                <p className="text-sm text-neutral-400">No private drafts yet.</p>
              ) : (
                privateDrafts.map((draft) => (
                  <div key={draft.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                    <p className="text-sm text-neutral-100">{draft.title}</p>
                    <p className="text-xs text-neutral-500">Updated {formatDate(draft.updatedAt)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
