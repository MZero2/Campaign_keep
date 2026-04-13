import { redirect } from "next/navigation";

import { updateCharacterAction } from "@/app/campaigns/[slug]/actions";
import { CharacterCreateForm } from "@/components/character-create-form";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";

type CharacterEditPageProps = {
  params: Promise<{ slug: string; characterId: string }>;
};

function jsonArrayToStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

export default async function CharacterEditPage({ params }: CharacterEditPageProps) {
  const { slug, characterId } = await params;
  const { access, sessionUser } = await requireCampaignContext(slug);

  const character = await prisma.character.findFirst({
    where: { id: characterId, campaignId: access.campaign.id },
    include: {
      stats: true,
      inventory: { select: { catalogItemId: true } },
      spells: { select: { catalogSpellId: true } },
      feats: { select: { name: true } },
    },
  });

  if (!character) redirect(`/campaigns/${slug}/characters`);
  if (!access.isMaster && character.ownerUserId !== sessionUser.id) {
    redirect(`/campaigns/${slug}/characters?error=forbidden`);
  }

  const [classCatalog, featCatalog, spellCatalog, itemCatalog, actionCatalog] = await Promise.all([
    prisma.dndClassCatalog.findMany({
      where: { systemKey: "DND_2024" },
      include: { subclasses: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.dndFeatCatalog.findMany({
      where: { systemKey: "DND_2024" },
      select: { id: true, name: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.dndSpellCatalog.findMany({
      where: { systemKey: "DND_2024" },
      select: { id: true, name: true, level: true, school: true, damage: true, damageType: true },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    }),
    prisma.dndItemCatalog.findMany({
      where: { systemKey: "DND_2024" },
      select: { id: true, name: true, category: true, damage: true, damageType: true, acBonus: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.dndActionCatalog.findMany({
      where: { systemKey: "DND_2024" },
      select: { id: true, name: true, actionType: true },
      orderBy: [{ actionType: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <CharacterCreateForm
      action={updateCharacterAction.bind(null, slug, character.id)}
      classes={classCatalog.map((entry) => ({
        id: entry.id,
        name: entry.name,
        hitDie: entry.hitDie,
        primaryAbility: entry.primaryAbility,
        spellcastingAbility: entry.spellcastingAbility,
        savingThrowProficiencies: jsonArrayToStrings(entry.savingThrowProficiencies),
        subclassUnlockLevel: entry.subclassUnlockLevel,
        subclasses: entry.subclasses,
      }))}
      feats={featCatalog}
      spells={spellCatalog}
      items={itemCatalog}
      coreActions={actionCatalog}
      mode="edit"
      submitLabel="Save Character"
      initialValues={{
        name: character.name,
        classCatalogId: character.classCatalogId ?? "",
        subclassCatalogId: character.subclassCatalogId,
        raceName: character.raceName ?? "",
        background: character.background,
        alignment: character.alignment,
        level: character.level,
        visibility: character.visibility === "OWNED_PRIVATE" ? "OWNED_PRIVATE" : "PUBLIC_CAMPAIGN",
        armorBonus: 0,
        str: character.stats?.str ?? 10,
        dex: character.stats?.dex ?? 10,
        con: character.stats?.con ?? 10,
        int: character.stats?.int ?? 10,
        wis: character.stats?.wis ?? 10,
        cha: character.stats?.cha ?? 10,
        skillProficiencies: jsonArrayToStrings(character.stats?.skills),
        featNames: character.feats.map((feat) => feat.name),
        selectedSpellIds: character.spells.map((entry) => entry.catalogSpellId).filter((entry): entry is string => Boolean(entry)),
        selectedItemIds: character.inventory.map((entry) => entry.catalogItemId).filter((entry): entry is string => Boolean(entry)),
      }}
    />
  );
}
