import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { toTitleCase } from "@/lib/utils";

type QuestsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function QuestsPage({ params }: QuestsPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

  const quests = await prisma.quest.findMany({
    where: {
      campaignId: access.campaign.id,
      ...(access.isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quests</CardTitle>
        <CardDescription>Missioni, obiettivi e stato avanzamento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests.length === 0 ? (
          <p className="text-sm text-neutral-400">No quests yet.</p>
        ) : (
          quests.map((quest) => (
            <article key={quest.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-neutral-100">{quest.title}</h3>
                <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-xs text-sky-200">
                  {toTitleCase(quest.status)}
                </span>
                <VisibilityBadge visibility={quest.visibility} />
              </div>
              <p className="text-sm text-neutral-300">{quest.summary || "No summary."}</p>
              {access.isMaster && quest.privateNotes ? (
                <p className="mt-2 rounded-md border border-amber-400/20 bg-amber-400/5 p-2 text-xs text-neutral-300">
                  Master: {quest.privateNotes}
                </p>
              ) : null}
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
