import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";

type NpcsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NpcsPage({ params }: NpcsPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

  const npcs = await prisma.npc.findMany({
    where: {
      campaignId: access.campaign.id,
      ...(access.isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
    },
    include: {
      location: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>NPCs</CardTitle>
        <CardDescription>Personaggi non giocanti conosciuti nella campagna.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {npcs.length === 0 ? (
          <p className="text-sm text-neutral-400">No NPC entries yet.</p>
        ) : (
          npcs.map((npc) => (
            <article key={npc.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-neutral-100">{npc.name}</h3>
                <VisibilityBadge visibility={npc.visibility} />
              </div>
              <p className="text-xs text-neutral-400">{npc.publicDescription || "No public description."}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Status: {npc.status} · Faction: {npc.faction ?? "N/A"}
              </p>
              <p className="text-xs text-neutral-500">Location: {npc.location?.name ?? "Unknown"}</p>
              {access.isMaster && npc.privateNotes ? (
                <p className="mt-2 rounded-md border border-amber-400/20 bg-amber-400/5 p-2 text-xs text-neutral-300">
                  Master: {npc.privateNotes}
                </p>
              ) : null}
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
