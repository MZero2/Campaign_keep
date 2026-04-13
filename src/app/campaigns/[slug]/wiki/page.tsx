import Link from "next/link";

import { createWikiPageAction } from "@/app/campaigns/[slug]/wiki/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type WikiIndexPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMap: Record<string, string> = {
  invalid_wiki_input: "Compila titolo, contenuto e visibilità in modo valido.",
  forbidden: "Solo il master può modificare il wiki.",
};

export default async function WikiIndexPage({ params, searchParams }: WikiIndexPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);
  const isMaster = access.isMaster;
  const resolvedSearchParams = await searchParams;

  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const error = typeof resolvedSearchParams.error === "string" ? errorMap[resolvedSearchParams.error] : null;

  const pages = await prisma.wikiPage.findMany({
    where: {
      campaignId: access.campaign.id,
      ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      visibility: true,
      updatedAt: true,
    },
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Wiki</CardTitle>
          <CardDescription>Lore, fazioni, religioni, cronache e storia della campagna.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="mb-4 flex gap-2" action={`/campaigns/${slug}/wiki`} method="get">
            <Input name="q" placeholder="Search wiki pages..." defaultValue={query} />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <div className="space-y-3">
            {pages.length === 0 ? (
              <p className="text-sm text-neutral-400">No wiki pages yet.</p>
            ) : (
              pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/campaigns/${slug}/wiki/${page.slug}`}
                  className="block rounded-md border border-neutral-800 bg-neutral-900/60 p-4 hover:bg-neutral-900"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-neutral-100">{page.title}</h3>
                    <VisibilityBadge visibility={page.visibility} />
                  </div>
                  <p className="line-clamp-3 text-sm text-neutral-400">
                    {page.content.slice(0, 220)}
                    {page.content.length > 220 ? "..." : ""}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">Updated {formatDate(page.updatedAt)}</p>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Page</CardTitle>
          <CardDescription>{isMaster ? "Nuova pagina lore." : "Solo il master può creare pagine."}</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="mb-3 rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          {isMaster ? (
            <form action={createWikiPageAction.bind(null, slug)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Ashen Faction" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" name="tags" placeholder="faction, lore, city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                  id="visibility"
                  name="visibility"
                  className="h-10 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100"
                  defaultValue="PUBLIC_CAMPAIGN"
                >
                  <option value="PUBLIC_CAMPAIGN">Public to Campaign</option>
                  <option value="PRIVATE_MASTER">Private to Master</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  className="min-h-44"
                  placeholder="Write lore or notes in markdown/plain text..."
                  required
                />
              </div>
              <Button type="submit">Create Wiki Page</Button>
            </form>
          ) : (
            <p className="text-sm text-neutral-400">
              Il master gestisce creazione e aggiornamento delle pagine wiki.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
