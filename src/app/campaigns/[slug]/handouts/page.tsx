import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type HandoutsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function HandoutsPage({ params }: HandoutsPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

  const handouts = await prisma.handout.findMany({
    where: {
      campaignId: access.campaign.id,
      ...(access.isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
    },
    include: {
      uploadedBy: {
        select: { displayName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Handouts</CardTitle>
        <CardDescription>Archivio condiviso di immagini, PDF, audio e documenti.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {handouts.length === 0 ? (
          <p className="text-sm text-neutral-400">No handouts uploaded.</p>
        ) : (
          handouts.map((handout) => (
            <article key={handout.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-neutral-100">{handout.title}</h3>
                <VisibilityBadge visibility={handout.visibility} />
              </div>
              <p className="text-xs text-neutral-400">{handout.description || "No description."}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Type: {handout.fileType} · Uploaded by {handout.uploadedBy.displayName} ·{" "}
                {formatDate(handout.createdAt)}
              </p>
              <Link
                href={handout.fileUrl}
                target="_blank"
                className="mt-3 inline-flex h-8 items-center rounded-md border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-200 hover:bg-neutral-800"
              >
                Open file
              </Link>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
