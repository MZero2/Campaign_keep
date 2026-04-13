import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";

type ItemsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

  const items = await prisma.item.findMany({
    where: {
      campaignId: access.campaign.id,
      ...(access.isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
    },
    include: {
      ownerCharacter: {
        select: { name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
        <CardDescription>Oggetti di campagna, loot e risorse del party.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400">No items available.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-neutral-100">{item.name}</h3>
                <VisibilityBadge visibility={item.visibility} />
              </div>
              <p className="text-xs text-neutral-400">{item.description || "No description."}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Type: {item.type ?? "N/A"} · Rarity: {item.rarity ?? "N/A"}
              </p>
              <p className="text-xs text-neutral-500">Owner: {item.ownerCharacter?.name ?? "Unassigned"}</p>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
