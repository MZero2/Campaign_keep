import { createCharacterAction } from "@/app/campaigns/[slug]/actions";
import { CharacterCreateForm } from "@/components/character-create-form";
import { VisibilityBadge } from "@/components/visibility-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCampaignContext } from "@/lib/campaign";
import { getClassTheme } from "@/lib/dnd2024";
import { prisma } from "@/lib/prisma";

type CharactersPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const characterErrorMap: Record<string, string> = {
  invalid_character: "Controlla i dati della scheda: alcuni valori non sono validi.",
  character_name_taken: "Hai gia un personaggio con questo nome in questa campagna.",
  invalid_subclass: "Sottoclasse non valida per la classe selezionata.",
};

export default async function CharactersPage({ params, searchParams }: CharactersPageProps) {
  const { slug } = await params;
  const { access, sessionUser } = await requireCampaignContext(slug);
  const resolvedSearchParams = await searchParams;
  const characterError =
    typeof resolvedSearchParams.error === "string" ? characterErrorMap[resolvedSearchParams.error] : null;

  const [characters, classCatalog, featCatalog] = await Promise.all([
    prisma.character.findMany({
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
        inventory: { orderBy: { createdAt: "desc" }, take: 5 },
        spells: { orderBy: { level: "asc" }, take: 5 },
        feats: { orderBy: [{ category: "asc" }, { name: "asc" }], take: 24 },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.dndClassCatalog.findMany({
      where: { systemKey: "DND_2024" },
      include: {
        subclasses: {
          orderBy: { name: "asc" },
          select: { name: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.dndFeatCatalog.findMany({
      where: { systemKey: "DND_2024" },
      select: { name: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Characters</CardTitle>
          <CardDescription>
            Scheda D&D 2024 completa con sottoclassi e talenti, tema grafico in base alla classe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {characters.length === 0 ? (
            <p className="text-sm text-neutral-400">No characters yet.</p>
          ) : (
            characters.map((character) => {
              const theme = getClassTheme(character.className);

              return (
                <article key={character.id} className={`rounded-md border p-4 ${theme.cardClass}`}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className={`text-base font-medium ${theme.accentClass}`}>{character.name}</h3>
                    <VisibilityBadge visibility={character.visibility} />
                    {character.className ? (
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${theme.badgeClass}`}>
                        {character.className}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-neutral-300">
                    Lv. {character.level} {character.className ?? "Adventurer"}{" "}
                    {character.subclassName ? `(${character.subclassName})` : ""} -{" "}
                    {character.raceName ?? "Unknown race"} - Owner: {character.ownerUser.displayName}
                  </p>
                  {character.stats ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-neutral-200 sm:grid-cols-6">
                      <div className="rounded border border-neutral-700 bg-neutral-950/70 p-2">STR {character.stats.str}</div>
                      <div className="rounded border border-neutral-700 bg-neutral-950/70 p-2">DEX {character.stats.dex}</div>
                      <div className="rounded border border-neutral-700 bg-neutral-950/70 p-2">CON {character.stats.con}</div>
                      <div className="rounded border border-neutral-700 bg-neutral-950/70 p-2">INT {character.stats.int}</div>
                      <div className="rounded border border-neutral-700 bg-neutral-950/70 p-2">WIS {character.stats.wis}</div>
                      <div className="rounded border border-neutral-700 bg-neutral-950/70 p-2">CHA {character.stats.cha}</div>
                    </div>
                  ) : null}
                  {character.stats ? (
                    <p className="mt-2 text-xs text-neutral-400">
                      HP {character.stats.hpCurrent}/{character.stats.hpMax} - AC {character.stats.ac} - Speed{" "}
                      {character.stats.speed} - Init {character.stats.initiativeBonus} - Prof{" "}
                      {character.stats.proficiencyBonus}
                    </p>
                  ) : null}
                  {character.feats.length > 0 ? (
                    <p className="mt-2 text-xs text-neutral-200">
                      Feats:{" "}
                      {character.feats.map((feat) => `${feat.name} [${feat.category}]`).join(" - ")}
                    </p>
                  ) : null}
                  {character.inventory.length > 0 ? (
                    <p className="mt-2 text-xs text-neutral-300">
                      Inventory: {character.inventory.map((item) => `${item.name} x${item.quantity}`).join(" - ")}
                    </p>
                  ) : null}
                  {character.spells.length > 0 ? (
                    <p className="mt-1 text-xs text-neutral-400">
                      Spells: {character.spells.map((spell) => spell.name).join(", ")}
                    </p>
                  ) : null}
                </article>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Character</CardTitle>
          <CardDescription>Dati manuale 2024 da catalogo DB (fisico) + calcoli automatici.</CardDescription>
        </CardHeader>
        <CardContent>
          {characterError ? (
            <p className="mb-3 rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {characterError}
            </p>
          ) : null}
          <CharacterCreateForm
            action={createCharacterAction.bind(null, slug)}
            classes={classCatalog.map((entry) => ({
              name: entry.name,
              hitDie: entry.hitDie,
              subclasses: entry.subclasses.map((subclass) => subclass.name),
            }))}
            feats={featCatalog}
          />
        </CardContent>
      </Card>
    </div>
  );
}
