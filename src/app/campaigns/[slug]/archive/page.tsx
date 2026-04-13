import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";

type ArchivePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

  const [archivedQuests, inactiveCharacters] = await Promise.all([
    prisma.quest.findMany({
      where: {
        campaignId: access.campaign.id,
        status: { in: ["COMPLETED", "FAILED", "HIDDEN"] },
        ...(access.isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.character.findMany({
      where: {
        campaignId: access.campaign.id,
        isActive: false,
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Archived Quests</CardTitle>
          <CardDescription>Quest concluse, fallite o nascoste.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {archivedQuests.length === 0 ? (
            <p className="text-sm text-neutral-400">No archived quests yet.</p>
          ) : (
            archivedQuests.map((quest) => (
              <div key={quest.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                <p className="text-sm text-neutral-100">{quest.title}</p>
                <p className="text-xs text-neutral-500">{quest.status}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inactive Characters</CardTitle>
          <CardDescription>Personaggi non più attivi nella campagna.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {inactiveCharacters.length === 0 ? (
            <p className="text-sm text-neutral-400">No inactive characters.</p>
          ) : (
            inactiveCharacters.map((character) => (
              <div key={character.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                <p className="text-sm text-neutral-100">{character.name}</p>
                <p className="text-xs text-neutral-500">
                  Lv. {character.level} {character.className ?? "Adventurer"}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
