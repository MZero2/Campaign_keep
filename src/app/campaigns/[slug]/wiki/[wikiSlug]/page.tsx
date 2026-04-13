import { notFound } from "next/navigation";

import { deleteWikiPageAction, updateWikiPageAction } from "@/app/campaigns/[slug]/wiki/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type WikiDetailPageProps = {
  params: Promise<{ slug: string; wikiSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function tagsToString(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.filter((tag): tag is string => typeof tag === "string").join(", ");
}

export default async function WikiDetailPage({ params, searchParams }: WikiDetailPageProps) {
  const { slug, wikiSlug } = await params;
  const { access } = await requireCampaignContext(slug);
  const isMaster = access.isMaster;
  const resolvedSearchParams = await searchParams;

  const page = await prisma.wikiPage.findUnique({
    where: {
      campaignId_slug: {
        campaignId: access.campaign.id,
        slug: wikiSlug,
      },
    },
    include: {
      creator: {
        select: { displayName: true },
      },
      updater: {
        select: { displayName: true },
      },
    },
  });

  if (!page) {
    notFound();
  }

  if (!isMaster && page.visibility !== "PUBLIC_CAMPAIGN") {
    notFound();
  }

  const saved = resolvedSearchParams.saved === "1";
  const hasError = resolvedSearchParams.error === "invalid_wiki_input";

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <VisibilityBadge visibility={page.visibility} />
          <p className="text-xs text-neutral-500">
            Created by {page.creator.displayName} · Last update by {page.updater.displayName}
          </p>
        </div>
        <CardTitle className="font-heading text-3xl">{page.title}</CardTitle>
        <CardDescription>Updated {formatDate(page.updatedAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        {saved ? (
          <p className="mb-3 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            Wiki page saved.
          </p>
        ) : null}
        {hasError ? (
          <p className="mb-3 rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            Invalid input. Check required fields.
          </p>
        ) : null}

        {isMaster ? (
          <div className="space-y-4">
            <form action={updateWikiPageAction.bind(null, slug, page.slug)} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={page.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" name="tags" defaultValue={tagsToString(page.tags)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                  id="visibility"
                  name="visibility"
                  className="h-10 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100"
                  defaultValue={page.visibility}
                >
                  <option value="PUBLIC_CAMPAIGN">Public to Campaign</option>
                  <option value="PRIVATE_MASTER">Private to Master</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" name="content" defaultValue={page.content} className="min-h-72" required />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>

            <form action={deleteWikiPageAction.bind(null, slug, page.slug)}>
              <Button type="submit" variant="destructive">
                Delete Page
              </Button>
            </form>
          </div>
        ) : (
          <article className="whitespace-pre-wrap rounded-md border border-neutral-800 bg-neutral-900/60 p-4 text-sm leading-7 text-neutral-200">
            {page.content}
          </article>
        )}
      </CardContent>
    </Card>
  );
}
