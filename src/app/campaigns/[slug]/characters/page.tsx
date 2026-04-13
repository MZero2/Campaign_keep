import Link from "next/link";

import { VisibilityBadge } from "@/components/visibility-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCampaignContext } from "@/lib/campaign";
import { getClassTheme } from "@/lib/dnd2024";
import { prisma } from "@/lib/prisma";

type CharactersPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const characterErrorMap: Record<string, string> = {
  forbidden: "Non hai i permessi per modificare questo personaggio.",
  invalid_character: "Controlla i dati della scheda: alcuni valori non sono validi.",
  character_name_taken: "Hai gia un personaggio con questo nome in questa campagna.",
  invalid_class: "Classe non valida.",
  invalid_subclass: "Sottoclasse non valida per la classe selezionata.",
};

export default async function CharactersPage({ params, searchParams }: CharactersPageProps) {
  const { slug } = await params;
  const { access, sessionUser } = await requireCampaignContext(slug);
  const resolvedSearchParams = await searchParams;
  const characterError =
    typeof resolvedSearchParams.error === "string" ? characterErrorMap[resolvedSearchParams.error] : null;

  const characters = await prisma.character.findMany({
    where: {
      campaignId: access.campaign.id,
      ...(access.isMaster
        ? {}
        : {
            OR: [{ visibility: "PUBLIC_CAMPAIGN" }, { ownerUserId: sessionUser.id }],
          }),
    },
    include: {
      ownerUser: { select: { displayName: true } },
      stats: true,
      feats: { orderBy: [{ category: "asc" }, { name: "asc" }], take: 4 },
      attacks: { orderBy: { createdAt: "asc" }, take: 2 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,#f59e0b15_0%,transparent_35%),linear-gradient(180deg,rgba(17,24,39,0.92)_0%,rgba(9,12,16,0.94)_100%)] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-200/65">Character Roster</p>
            <h1 className="font-heading text-4xl text-white sm:text-5xl">Sheets that feel alive</h1>
            <p className="mt-3 text-base text-neutral-300">
              Il roster adesso porta a una vera scheda personaggio e a un builder dedicato, non piu a un form compresso.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href={`/campaigns/${slug}/characters/new`}>Create Character</Link>
          </Button>
        </div>
      </section>

      {characterError ? (
        <p className="rounded-md border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {characterError}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {characters.length === 0 ? (
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>No characters yet</CardTitle>
              <CardDescription>Il party non ha ancora una scheda attiva in questa campagna.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/campaigns/${slug}/characters/new`}>Forge the first sheet</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          characters.map((character) => {
            const theme = getClassTheme(character.className);
            const canEdit = access.isMaster || character.ownerUserId === sessionUser.id;

            return (
              <article key={character.id} className={`rounded-[30px] border p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] ${theme.cardClass}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`font-heading text-3xl ${theme.accentClass}`}>{character.name}</h2>
                  <VisibilityBadge visibility={character.visibility} />
                </div>
                <p className="mt-2 text-sm text-neutral-300">
                  Lv. {character.level} {character.className ?? "Adventurer"}
                  {character.subclassName ? ` · ${character.subclassName}` : ""} · {character.raceName ?? "Unknown species"}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Owner {character.ownerUser.displayName}
                </p>

                {character.stats ? (
                  <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {[
                      ["STR", character.stats.str],
                      ["DEX", character.stats.dex],
                      ["CON", character.stats.con],
                      ["INT", character.stats.int],
                      ["WIS", character.stats.wis],
                      ["CHA", character.stats.cha],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">{label}</p>
                        <p className="font-heading text-2xl text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 text-sm text-neutral-300 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    HP {character.stats?.hpCurrent ?? "?"}/{character.stats?.hpMax ?? "?"}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    AC {character.stats?.ac ?? "?"}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    Init {character.stats?.initiativeBonus ?? "?"}
                  </div>
                </div>

                {character.attacks.length > 0 ? (
                  <p className="mt-4 text-sm text-neutral-200">
                    Actions preview: {character.attacks.map((attack) => attack.name).join(" · ")}
                  </p>
                ) : null}

                {character.feats.length > 0 ? (
                  <p className="mt-2 text-xs text-neutral-400">
                    Feats: {character.feats.map((feat) => feat.name).join(", ")}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/campaigns/${slug}/characters/${character.id}`}>Open Sheet</Link>
                  </Button>
                  {canEdit ? (
                    <Button asChild variant="secondary">
                      <Link href={`/campaigns/${slug}/characters/${character.id}/edit`}>Edit Build</Link>
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
