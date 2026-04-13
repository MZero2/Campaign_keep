import Link from "next/link";
import { Prisma } from "@prisma/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";

type CampaignSearchPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CampaignSearchPage({ params, searchParams }: CampaignSearchPageProps) {
  const { slug } = await params;
  const { access, sessionUser } = await requireCampaignContext(slug);
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";

  const isMaster = access.isMaster;
  const sessionSearchFilters: Prisma.CampaignSessionWhereInput[] = [
    { title: { contains: query, mode: "insensitive" } },
    { publicRecap: { contains: query, mode: "insensitive" } },
  ];
  if (isMaster) {
    sessionSearchFilters.push({ privateNotes: { contains: query, mode: "insensitive" } });
  }

  const [wiki, sessions, npcs, locations, items, quests, handouts, characters] = query
    ? await Promise.all([
        prisma.wikiPage.findMany({
          where: {
            campaignId: access.campaign.id,
            ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
            OR: [{ title: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }],
          },
          select: { id: true, title: true, slug: true },
          take: 5,
        }),
        prisma.campaignSession.findMany({
          where: {
            campaignId: access.campaign.id,
            OR: sessionSearchFilters,
          },
          select: { id: true, title: true },
          take: 5,
        }),
        prisma.npc.findMany({
          where: {
            campaignId: access.campaign.id,
            ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
            OR: [{ name: { contains: query, mode: "insensitive" } }, { publicDescription: { contains: query, mode: "insensitive" } }],
          },
          select: { id: true, name: true },
          take: 5,
        }),
        prisma.location.findMany({
          where: {
            campaignId: access.campaign.id,
            ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
            OR: [{ name: { contains: query, mode: "insensitive" } }, { publicDescription: { contains: query, mode: "insensitive" } }],
          },
          select: { id: true, name: true },
          take: 5,
        }),
        prisma.item.findMany({
          where: {
            campaignId: access.campaign.id,
            ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
            OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }],
          },
          select: { id: true, name: true },
          take: 5,
        }),
        prisma.quest.findMany({
          where: {
            campaignId: access.campaign.id,
            ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
            OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }],
          },
          select: { id: true, title: true },
          take: 5,
        }),
        prisma.handout.findMany({
          where: {
            campaignId: access.campaign.id,
            ...(isMaster ? {} : { visibility: "PUBLIC_CAMPAIGN" }),
            OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }],
          },
          select: { id: true, title: true },
          take: 5,
        }),
        prisma.character.findMany({
          where: {
            campaignId: access.campaign.id,
            ...(isMaster
              ? {}
              : {
                  OR: [{ visibility: "PUBLIC_CAMPAIGN" }, { ownerUserId: sessionUser.id }],
                }),
            name: { contains: query, mode: "insensitive" },
          },
          select: { id: true, name: true },
          take: 5,
        }),
      ])
    : [[], [], [], [], [], [], [], []];

  type SearchResultBucketItem = {
    id: string;
    title?: string;
    name?: string;
    slug?: string;
  };

  const buckets: Array<{
    label: string;
    items: SearchResultBucketItem[];
    href: (item: SearchResultBucketItem) => string;
  }> = [
    {
      label: "Wiki",
      items: wiki.map((item) => ({ id: item.id, title: item.title, slug: item.slug })),
      href: (item) => `/campaigns/${slug}/wiki/${item.slug}`,
    },
    {
      label: "Sessions",
      items: sessions.map((item) => ({ id: item.id, title: item.title })),
      href: () => `/campaigns/${slug}/sessions`,
    },
    {
      label: "NPCs",
      items: npcs.map((item) => ({ id: item.id, name: item.name })),
      href: () => `/campaigns/${slug}/npcs`,
    },
    {
      label: "Locations",
      items: locations.map((item) => ({ id: item.id, name: item.name })),
      href: () => `/campaigns/${slug}/locations`,
    },
    {
      label: "Items",
      items: items.map((item) => ({ id: item.id, name: item.name })),
      href: () => `/campaigns/${slug}/items`,
    },
    {
      label: "Quests",
      items: quests.map((item) => ({ id: item.id, title: item.title })),
      href: () => `/campaigns/${slug}/quests`,
    },
    {
      label: "Handouts",
      items: handouts.map((item) => ({ id: item.id, title: item.title })),
      href: () => `/campaigns/${slug}/handouts`,
    },
    {
      label: "Characters",
      items: characters.map((item) => ({ id: item.id, name: item.name })),
      href: () => `/campaigns/${slug}/characters`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Search</CardTitle>
        <CardDescription>Ricerca base su wiki, sessioni, NPC, luoghi, oggetti, quest, handouts, personaggi.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="mb-6 flex gap-2" action={`/campaigns/${slug}/search`} method="get">
          <Input name="q" placeholder="Search across campaign..." defaultValue={query} />
          <button
            type="submit"
            className="rounded-md border border-neutral-700 bg-neutral-900 px-4 text-sm text-neutral-100 hover:bg-neutral-800"
          >
            Search
          </button>
        </form>

        {!query ? (
          <p className="text-sm text-neutral-400">Type a keyword to search campaign content.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {buckets.map((bucket) => (
              <section key={bucket.label} className="rounded-md border border-neutral-800 bg-neutral-900/60 p-4">
                <h3 className="mb-2 text-sm font-medium text-neutral-100">{bucket.label}</h3>
                {bucket.items.length === 0 ? (
                  <p className="text-xs text-neutral-500">No matches.</p>
                ) : (
                  <ul className="space-y-1 text-sm text-neutral-300">
                    {bucket.items.map((item) => (
                      <li key={item.id}>
                        <Link href={bucket.href(item)} className="hover:text-amber-300">
                          {"title" in item ? item.title : "name" in item ? item.name : "Result"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
