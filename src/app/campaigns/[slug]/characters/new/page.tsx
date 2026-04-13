import { createCharacterAction } from "@/app/campaigns/[slug]/actions";
import { CharacterCreateForm } from "@/components/character-create-form";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";

type CharacterNewPageProps = {
  params: Promise<{ slug: string }>;
};

function jsonArrayToStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

export default async function CharacterNewPage({ params }: CharacterNewPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

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
      action={createCharacterAction.bind(null, slug)}
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
      mode="create"
      submitLabel={`Forge sheet for ${access.campaign.title}`}
    />
  );
}
