import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";

type LocationsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocationsPage({ params }: LocationsPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

  const locations = await prisma.location.findMany({
    where: {
      campaignId: access.campaign.id,
      ...(access.isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
    },
    include: {
      parentLocation: {
        select: { name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locations</CardTitle>
        <CardDescription>Luoghi scoperti e aree rilevanti per la campagna.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {locations.length === 0 ? (
          <p className="text-sm text-neutral-400">No locations yet.</p>
        ) : (
          locations.map((location) => (
            <article key={location.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-neutral-100">{location.name}</h3>
                <VisibilityBadge visibility={location.visibility} />
              </div>
              <p className="text-xs text-neutral-400">{location.publicDescription || "No public description."}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Parent: {location.parentLocation?.name ?? "Top-level"} ·{" "}
                {location.discovered ? "Discovered" : "Hidden"}
              </p>
              {access.isMaster && location.privateNotes ? (
                <p className="mt-2 rounded-md border border-amber-400/20 bg-amber-400/5 p-2 text-xs text-neutral-300">
                  Master: {location.privateNotes}
                </p>
              ) : null}
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
