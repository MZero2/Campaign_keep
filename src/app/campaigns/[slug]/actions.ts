"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { CampaignRole, Prisma, Visibility } from "@prisma/client";

import { requireSessionUser } from "@/lib/auth";
import {
  abilityModifier,
  normalizeFeatList,
  normalizeSavingThrowList,
  normalizeSkillList,
  proficiencyBonusForLevel,
} from "@/lib/dnd2024";
import { getCampaignAccess } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import {
  characterCreateSchema,
  playerNoteCreateSchema,
  sessionCreateSchema,
} from "@/lib/validators";

async function requireCampaignMember(campaignSlug: string) {
  const user = await requireSessionUser();
  const access = await getCampaignAccess(campaignSlug, user.id);
  if (!access) notFound();
  return { user, access };
}

async function requireEditableCharacter(campaignSlug: string, characterId: string) {
  const { user, access } = await requireCampaignMember(campaignSlug);
  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      campaignId: access.campaign.id,
    },
    include: {
      stats: true,
    },
  });

  if (!character) {
    notFound();
  }

  const canEdit = access.membership.role === CampaignRole.MASTER || character.ownerUserId === user.id;
  if (!canEdit) {
    redirect(`/campaigns/${campaignSlug}/characters?error=forbidden`);
  }

  return { user, access, character };
}

function toStringArray(values: FormDataEntryValue[]) {
  return values.filter((value): value is string => typeof value === "string").map((value) => value.trim());
}

function jsonArrayToStrings(value: Prisma.JsonValue | null | undefined) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

export async function createSessionAction(campaignSlug: string, formData: FormData) {
  const { user, access } = await requireCampaignMember(campaignSlug);
  if (access.membership.role !== CampaignRole.MASTER) {
    redirect(`/campaigns/${campaignSlug}/sessions?error=forbidden`);
  }

  const parsed = sessionCreateSchema.safeParse({
    title: formData.get("title"),
    playedAt: formData.get("playedAt"),
    publicRecap: formData.get("publicRecap"),
    privateNotes: formData.get("privateNotes"),
  });

  if (!parsed.success) {
    redirect(`/campaigns/${campaignSlug}/sessions?error=invalid`);
  }

  const playedAtRaw = parsed.data.playedAt?.trim() ?? "";
  const playedAt = playedAtRaw ? new Date(playedAtRaw) : null;

  if (playedAt && Number.isNaN(playedAt.getTime())) {
    redirect(`/campaigns/${campaignSlug}/sessions?error=invalid_date`);
  }

  const maxNumberSession = await prisma.campaignSession.findFirst({
    where: { campaignId: access.campaign.id },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  await prisma.campaignSession.create({
    data: {
      campaignId: access.campaign.id,
      number: (maxNumberSession?.number ?? 0) + 1,
      title: parsed.data.title,
      playedAt,
      publicRecap: parsed.data.publicRecap?.trim() ?? "",
      privateNotes: parsed.data.privateNotes?.trim() ?? "",
      createdById: user.id,
    },
  });

  revalidatePath(`/campaigns/${campaignSlug}/sessions`);
}

export async function createCharacterAction(campaignSlug: string, formData: FormData) {
  const { user, access } = await requireCampaignMember(campaignSlug);

  const parsed = characterCreateSchema.safeParse({
    name: formData.get("name"),
    className: formData.get("className"),
    subclassName: formData.get("subclassName"),
    raceName: formData.get("raceName"),
    background: formData.get("background"),
    alignment: formData.get("alignment"),
    level: formData.get("level"),
    str: formData.get("str"),
    dex: formData.get("dex"),
    con: formData.get("con"),
    int: formData.get("int"),
    wis: formData.get("wis"),
    cha: formData.get("cha"),
    speed: formData.get("speed"),
    armorBonus: formData.get("armorBonus"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    redirect(`/campaigns/${campaignSlug}/characters?error=invalid_character`);
  }

  const classCatalogIdRaw = String(formData.get("classCatalogId") ?? "").trim();
  const subclassCatalogIdRaw = String(formData.get("subclassCatalogId") ?? "").trim();

  const classCatalog = classCatalogIdRaw
    ? await prisma.dndClassCatalog.findUnique({
        where: { id: classCatalogIdRaw },
        include: { subclasses: true },
      })
    : await prisma.dndClassCatalog.findFirst({
        where: {
          systemKey: "DND_2024",
          name: parsed.data.className,
        },
        include: { subclasses: true },
      });

  if (!classCatalog) {
    redirect(`/campaigns/${campaignSlug}/characters?error=invalid_class`);
  }

  const subclassCatalog = subclassCatalogIdRaw
    ? classCatalog.subclasses.find((subclass) => subclass.id === subclassCatalogIdRaw) ?? null
    : parsed.data.subclassName?.trim()
      ? classCatalog.subclasses.find((subclass) => subclass.name === parsed.data.subclassName?.trim()) ?? null
      : null;

  if (subclassCatalogIdRaw && !subclassCatalog) {
    redirect(`/campaigns/${campaignSlug}/characters?error=invalid_subclass`);
  }

  const name = parsed.data.name.trim();
  const level = parsed.data.level;
  const dexModifier = abilityModifier(parsed.data.dex);
  const conModifier = abilityModifier(parsed.data.con);
  const proficiencyBonus = proficiencyBonusForLevel(level);
  const hitDie = classCatalog.hitDie;
  const firstLevelHp = Math.max(1, hitDie + conModifier);
  const averageGainPerLevel = Math.max(1, Math.floor(hitDie / 2) + 1 + conModifier);
  const hpMax = level <= 1 ? firstLevelHp : firstLevelHp + averageGainPerLevel * (level - 1);
  const armorClass = Math.max(10, 10 + dexModifier + parsed.data.armorBonus);

  const classDefaultSaves = normalizeSavingThrowList(
    jsonArrayToStrings(classCatalog.savingThrowProficiencies as Prisma.JsonValue)
  );
  const selectedSaves = normalizeSavingThrowList(toStringArray(formData.getAll("savingThrowProficiencies")));
  const savingThrows = Array.from(new Set([...classDefaultSaves, ...selectedSaves]));

  const skills = normalizeSkillList(toStringArray(formData.getAll("skillProficiencies")));
  const selectedFeats = normalizeFeatList(toStringArray(formData.getAll("feats")));

  const selectedSpellIds = toStringArray(formData.getAll("spells"));
  const selectedItemIds = toStringArray(formData.getAll("items"));
  const selectedActionIds = toStringArray(formData.getAll("coreActions"));

  const existingCharacter = await prisma.character.findFirst({
    where: {
      campaignId: access.campaign.id,
      ownerUserId: user.id,
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });

  if (existingCharacter) {
    redirect(`/campaigns/${campaignSlug}/characters?error=character_name_taken`);
  }

  const [spellCatalogEntries, itemCatalogEntries, actionCatalogEntries, featureCatalogEntries] = await Promise.all([
    selectedSpellIds.length
      ? prisma.dndSpellCatalog.findMany({ where: { id: { in: selectedSpellIds } } })
      : Promise.resolve([]),
    selectedItemIds.length
      ? prisma.dndItemCatalog.findMany({ where: { id: { in: selectedItemIds } } })
      : Promise.resolve([]),
    selectedActionIds.length
      ? prisma.dndActionCatalog.findMany({ where: { id: { in: selectedActionIds } } })
      : Promise.resolve([]),
    prisma.dndClassFeatureCatalog.findMany({
      where: {
        systemKey: "DND_2024",
        level: { lte: level },
        OR: [{ classId: classCatalog.id }, ...(subclassCatalog ? [{ subclassId: subclassCatalog.id }] : [])],
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    }),
  ]);

  const character = await prisma.character.create({
    data: {
      campaignId: access.campaign.id,
      ownerUserId: user.id,
      classCatalogId: classCatalog.id,
      subclassCatalogId: subclassCatalog?.id ?? null,
      name,
      className: classCatalog.name,
      subclassName: subclassCatalog?.name ?? null,
      raceName: parsed.data.raceName.trim(),
      background: parsed.data.background?.trim() || null,
      alignment: parsed.data.alignment?.trim() || null,
      level,
      visibility:
        parsed.data.visibility === "PUBLIC_CAMPAIGN"
          ? Visibility.PUBLIC_CAMPAIGN
          : Visibility.OWNED_PRIVATE,
      stats: {
        create: {
          str: parsed.data.str,
          dex: parsed.data.dex,
          con: parsed.data.con,
          int: parsed.data.int,
          wis: parsed.data.wis,
          cha: parsed.data.cha,
          savingThrows,
          skills,
          hpCurrent: hpMax,
          hpMax,
          ac: armorClass,
          speed: parsed.data.speed,
          initiativeBonus: dexModifier,
          proficiencyBonus,
        },
      },
      feats: selectedFeats.length
        ? {
            create: selectedFeats.map((feat) => ({
              name: feat.name,
              category: feat.category,
              source: "PHB 2024",
            })),
          }
        : undefined,
      features: featureCatalogEntries.length
        ? {
            create: featureCatalogEntries.map((feature) => ({
              catalogFeatureId: feature.id,
              name: feature.name,
              level: feature.level,
              actionType: feature.actionType,
              description: feature.description,
              source: feature.source,
            })),
          }
        : undefined,
      spells: spellCatalogEntries.length
        ? {
            create: spellCatalogEntries.map((spell) => ({
              catalogSpellId: spell.id,
              name: spell.name,
              level: spell.level,
              school: spell.school,
              castingTime: spell.castingTime,
              range: spell.range,
              components: spell.components,
              duration: spell.duration,
              description: spell.description,
            })),
          }
        : undefined,
      inventory: itemCatalogEntries.length
        ? {
            create: itemCatalogEntries.map((item) => ({
              catalogItemId: item.id,
              name: item.name,
              description: item.description,
              quantity: 1,
              equipped: false,
            })),
          }
        : undefined,
      actions: actionCatalogEntries.length
        ? {
            create: actionCatalogEntries.map((action) => ({
              name: action.name,
              actionType: action.actionType,
              description: action.description,
              source: action.source,
            })),
          }
        : undefined,
    },
    include: {
      stats: true,
    },
  });

  if (itemCatalogEntries.length && character.stats) {
    const strModifier = abilityModifier(character.stats.str);
    const dexModifierForAttack = abilityModifier(character.stats.dex);
    const attackEntries = itemCatalogEntries
      .filter((item) => item.category === "Weapon" && item.damage)
      .map((item) => {
        const properties = jsonArrayToStrings(item.properties as Prisma.JsonValue);
        const useDex = properties.includes("Finesse") ? dexModifierForAttack >= strModifier : false;
        const chosenMod = useDex ? dexModifierForAttack : strModifier;
        const chosenAbility = useDex ? "DEX" : "STR";
        return {
          characterId: character.id,
          name: item.name,
          ability: chosenAbility,
          attackBonus: chosenMod + proficiencyBonus,
          damageDice: item.damage ?? "",
          damageType: item.damageType ?? null,
          notes: `From catalog item ${item.name}`,
        };
      });

    if (attackEntries.length) {
      await prisma.characterAttack.createMany({ data: attackEntries });
    }
  }

  if (spellCatalogEntries.length) {
    const spellAttacks = spellCatalogEntries
      .filter((spell) => spell.damage)
      .map((spell) => ({
        characterId: character.id,
        name: spell.name,
        ability: classCatalog.spellcastingAbility ?? null,
        attackBonus:
          spell.attackType && classCatalog.spellcastingAbility
            ? abilityModifier(
                classCatalog.spellcastingAbility === "INT"
                  ? parsed.data.int
                  : classCatalog.spellcastingAbility === "WIS"
                    ? parsed.data.wis
                    : parsed.data.cha
              ) + proficiencyBonus
            : null,
        damageDice: spell.damage ?? "",
        damageType: spell.damageType ?? null,
        notes: spell.saveAbility ? `Save: ${spell.saveAbility}` : "Spell attack/value from catalog",
      }));

    if (spellAttacks.length) {
      await prisma.characterAttack.createMany({ data: spellAttacks });
    }
  }

  revalidatePath(`/campaigns/${campaignSlug}/characters`);
  redirect(`/campaigns/${campaignSlug}/characters?created=${character.id}`);
}

export async function updateCharacterAction(campaignSlug: string, characterId: string, formData: FormData) {
  const { character } = await requireEditableCharacter(campaignSlug, characterId);

  const parsed = characterCreateSchema.safeParse({
    name: formData.get("name"),
    className: formData.get("className"),
    subclassName: formData.get("subclassName"),
    raceName: formData.get("raceName"),
    background: formData.get("background"),
    alignment: formData.get("alignment"),
    level: formData.get("level"),
    str: formData.get("str"),
    dex: formData.get("dex"),
    con: formData.get("con"),
    int: formData.get("int"),
    wis: formData.get("wis"),
    cha: formData.get("cha"),
    speed: formData.get("speed"),
    armorBonus: formData.get("armorBonus"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    redirect(`/campaigns/${campaignSlug}/characters/${characterId}/edit?error=invalid_character`);
  }

  const classCatalogIdRaw = String(formData.get("classCatalogId") ?? "").trim();
  const subclassCatalogIdRaw = String(formData.get("subclassCatalogId") ?? "").trim();

  const classCatalog = classCatalogIdRaw
    ? await prisma.dndClassCatalog.findUnique({
        where: { id: classCatalogIdRaw },
        include: { subclasses: true },
      })
    : await prisma.dndClassCatalog.findFirst({
        where: {
          systemKey: "DND_2024",
          name: parsed.data.className,
        },
        include: { subclasses: true },
      });

  if (!classCatalog) {
    redirect(`/campaigns/${campaignSlug}/characters/${characterId}/edit?error=invalid_class`);
  }

  const subclassCatalog = subclassCatalogIdRaw
    ? classCatalog.subclasses.find((subclass) => subclass.id === subclassCatalogIdRaw) ?? null
    : parsed.data.subclassName?.trim()
      ? classCatalog.subclasses.find((subclass) => subclass.name === parsed.data.subclassName?.trim()) ?? null
      : null;

  if (subclassCatalogIdRaw && !subclassCatalog) {
    redirect(`/campaigns/${campaignSlug}/characters/${characterId}/edit?error=invalid_subclass`);
  }

  const name = parsed.data.name.trim();
  const level = parsed.data.level;
  const dexModifier = abilityModifier(parsed.data.dex);
  const conModifier = abilityModifier(parsed.data.con);
  const proficiencyBonus = proficiencyBonusForLevel(level);
  const hitDie = classCatalog.hitDie;
  const firstLevelHp = Math.max(1, hitDie + conModifier);
  const averageGainPerLevel = Math.max(1, Math.floor(hitDie / 2) + 1 + conModifier);
  const hpMax = level <= 1 ? firstLevelHp : firstLevelHp + averageGainPerLevel * (level - 1);
  const armorClass = Math.max(10, 10 + dexModifier + parsed.data.armorBonus);

  const classDefaultSaves = normalizeSavingThrowList(
    jsonArrayToStrings(classCatalog.savingThrowProficiencies as Prisma.JsonValue)
  );
  const selectedSaves = normalizeSavingThrowList(toStringArray(formData.getAll("savingThrowProficiencies")));
  const savingThrows = Array.from(new Set([...classDefaultSaves, ...selectedSaves]));

  const skills = normalizeSkillList(toStringArray(formData.getAll("skillProficiencies")));
  const selectedFeats = normalizeFeatList(toStringArray(formData.getAll("feats")));
  const selectedSpellIds = toStringArray(formData.getAll("spells"));
  const selectedItemIds = toStringArray(formData.getAll("items"));
  const selectedActionIds = toStringArray(formData.getAll("coreActions"));

  const existingCharacter = await prisma.character.findFirst({
    where: {
      campaignId: character.campaignId,
      ownerUserId: character.ownerUserId,
      name: { equals: name, mode: "insensitive" },
      id: { not: character.id },
    },
    select: { id: true },
  });

  if (existingCharacter) {
    redirect(`/campaigns/${campaignSlug}/characters/${characterId}/edit?error=character_name_taken`);
  }

  const [spellCatalogEntries, itemCatalogEntries, actionCatalogEntries, featureCatalogEntries] = await Promise.all([
    selectedSpellIds.length
      ? prisma.dndSpellCatalog.findMany({ where: { id: { in: selectedSpellIds } } })
      : Promise.resolve([]),
    selectedItemIds.length
      ? prisma.dndItemCatalog.findMany({ where: { id: { in: selectedItemIds } } })
      : Promise.resolve([]),
    selectedActionIds.length
      ? prisma.dndActionCatalog.findMany({ where: { id: { in: selectedActionIds } } })
      : Promise.resolve([]),
    prisma.dndClassFeatureCatalog.findMany({
      where: {
        systemKey: "DND_2024",
        level: { lte: level },
        OR: [{ classId: classCatalog.id }, ...(subclassCatalog ? [{ subclassId: subclassCatalog.id }] : [])],
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    }),
  ]);

  const strModifier = abilityModifier(parsed.data.str);
  const dexModifierForAttack = abilityModifier(parsed.data.dex);
  const itemAttacks = itemCatalogEntries
    .filter((item) => item.category === "Weapon" && item.damage)
    .map((item) => {
      const properties = jsonArrayToStrings(item.properties as Prisma.JsonValue);
      const useDex = properties.includes("Finesse") ? dexModifierForAttack >= strModifier : false;
      const chosenMod = useDex ? dexModifierForAttack : strModifier;
      const chosenAbility = useDex ? "DEX" : "STR";
      return {
        characterId: character.id,
        name: item.name,
        ability: chosenAbility,
        attackBonus: chosenMod + proficiencyBonus,
        damageDice: item.damage ?? "",
        damageType: item.damageType ?? null,
        notes: `From catalog item ${item.name}`,
      };
    });

  const spellAttacks = spellCatalogEntries
    .filter((spell) => spell.damage)
    .map((spell) => ({
      characterId: character.id,
      name: spell.name,
      ability: classCatalog.spellcastingAbility ?? null,
      attackBonus:
        spell.attackType && classCatalog.spellcastingAbility
          ? abilityModifier(
              classCatalog.spellcastingAbility === "INT"
                ? parsed.data.int
                : classCatalog.spellcastingAbility === "WIS"
                  ? parsed.data.wis
                  : parsed.data.cha
            ) + proficiencyBonus
          : null,
      damageDice: spell.damage ?? "",
      damageType: spell.damageType ?? null,
      notes: spell.saveAbility ? `Save: ${spell.saveAbility}` : "Spell attack/value from catalog",
    }));

  await prisma.$transaction(async (tx) => {
    await tx.character.update({
      where: { id: character.id },
      data: {
        classCatalogId: classCatalog.id,
        subclassCatalogId: subclassCatalog?.id ?? null,
        name,
        className: classCatalog.name,
        subclassName: subclassCatalog?.name ?? null,
        raceName: parsed.data.raceName.trim(),
        background: parsed.data.background?.trim() || null,
        alignment: parsed.data.alignment?.trim() || null,
        level,
        visibility:
          parsed.data.visibility === "PUBLIC_CAMPAIGN"
            ? Visibility.PUBLIC_CAMPAIGN
            : Visibility.OWNED_PRIVATE,
      },
    });

    await tx.characterStats.upsert({
      where: { characterId: character.id },
      update: {
        str: parsed.data.str,
        dex: parsed.data.dex,
        con: parsed.data.con,
        int: parsed.data.int,
        wis: parsed.data.wis,
        cha: parsed.data.cha,
        savingThrows,
        skills,
        hpCurrent: hpMax,
        hpMax,
        ac: armorClass,
        speed: parsed.data.speed,
        initiativeBonus: dexModifier,
        proficiencyBonus,
      },
      create: {
        characterId: character.id,
        str: parsed.data.str,
        dex: parsed.data.dex,
        con: parsed.data.con,
        int: parsed.data.int,
        wis: parsed.data.wis,
        cha: parsed.data.cha,
        savingThrows,
        skills,
        hpCurrent: hpMax,
        hpMax,
        ac: armorClass,
        speed: parsed.data.speed,
        initiativeBonus: dexModifier,
        proficiencyBonus,
      },
    });

    await tx.characterFeat.deleteMany({ where: { characterId: character.id } });
    if (selectedFeats.length) {
      await tx.characterFeat.createMany({
        data: selectedFeats.map((feat) => ({
          characterId: character.id,
          name: feat.name,
          category: feat.category,
          source: "PHB 2024",
        })),
      });
    }

    await tx.characterFeature.deleteMany({ where: { characterId: character.id } });
    if (featureCatalogEntries.length) {
      await tx.characterFeature.createMany({
        data: featureCatalogEntries.map((feature) => ({
          characterId: character.id,
          catalogFeatureId: feature.id,
          name: feature.name,
          level: feature.level,
          actionType: feature.actionType,
          description: feature.description,
          source: feature.source,
        })),
      });
    }

    await tx.characterSpell.deleteMany({ where: { characterId: character.id } });
    if (spellCatalogEntries.length) {
      await tx.characterSpell.createMany({
        data: spellCatalogEntries.map((spell) => ({
          characterId: character.id,
          catalogSpellId: spell.id,
          name: spell.name,
          level: spell.level,
          school: spell.school,
          castingTime: spell.castingTime,
          range: spell.range,
          components: spell.components,
          duration: spell.duration,
          description: spell.description,
        })),
      });
    }

    await tx.characterInventoryItem.deleteMany({ where: { characterId: character.id } });
    if (itemCatalogEntries.length) {
      await tx.characterInventoryItem.createMany({
        data: itemCatalogEntries.map((item) => ({
          characterId: character.id,
          catalogItemId: item.id,
          name: item.name,
          description: item.description,
          quantity: 1,
          equipped: false,
        })),
      });
    }

    await tx.characterAction.deleteMany({ where: { characterId: character.id } });
    if (actionCatalogEntries.length) {
      await tx.characterAction.createMany({
        data: actionCatalogEntries.map((action) => ({
          characterId: character.id,
          name: action.name,
          actionType: action.actionType,
          description: action.description,
          source: action.source,
        })),
      });
    }

    await tx.characterAttack.deleteMany({
      where: {
        characterId: character.id,
        OR: [
          { notes: { startsWith: "From catalog item" } },
          { notes: { startsWith: "Save:" } },
          { notes: "Spell attack/value from catalog" },
        ],
      },
    });

    const rebuiltAttacks = [...itemAttacks, ...spellAttacks];
    if (rebuiltAttacks.length) {
      await tx.characterAttack.createMany({ data: rebuiltAttacks });
    }
  });

  revalidatePath(`/campaigns/${campaignSlug}/characters`);
  revalidatePath(`/campaigns/${campaignSlug}/characters/${characterId}/edit`);
  redirect(`/campaigns/${campaignSlug}/characters/${characterId}/edit?updated=1`);
}

export async function addCharacterAttackAction(campaignSlug: string, formData: FormData) {
  const characterId = String(formData.get("characterId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!characterId || name.length < 2) {
    redirect(`/campaigns/${campaignSlug}/characters?error=invalid_attack`);
  }

  await requireEditableCharacter(campaignSlug, characterId);

  const ability = String(formData.get("ability") ?? "").trim() || null;
  const attackBonusRaw = String(formData.get("attackBonus") ?? "").trim();
  const damageDice = String(formData.get("damageDice") ?? "").trim() || null;
  const damageType = String(formData.get("damageType") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim();
  const attackBonus = attackBonusRaw ? Number(attackBonusRaw) : null;

  await prisma.characterAttack.create({
    data: {
      characterId,
      name,
      ability,
      attackBonus: Number.isNaN(attackBonus ?? 0) ? null : attackBonus,
      damageDice,
      damageType,
      notes,
    },
  });

  revalidatePath(`/campaigns/${campaignSlug}/characters`);
}

export async function addCharacterActionEntryAction(campaignSlug: string, formData: FormData) {
  const characterId = String(formData.get("characterId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const actionType = String(formData.get("actionType") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!characterId || name.length < 2 || actionType.length < 3 || description.length < 4) {
    redirect(`/campaigns/${campaignSlug}/characters?error=invalid_action`);
  }

  await requireEditableCharacter(campaignSlug, characterId);

  await prisma.characterAction.create({
    data: {
      characterId,
      name,
      actionType,
      description,
      source: "Character Sheet",
    },
  });

  revalidatePath(`/campaigns/${campaignSlug}/characters`);
}

export async function addCharacterSpellAction(campaignSlug: string, formData: FormData) {
  const characterId = String(formData.get("characterId") ?? "").trim();
  if (!characterId) {
    redirect(`/campaigns/${campaignSlug}/characters?error=invalid_spell`);
  }

  await requireEditableCharacter(campaignSlug, characterId);

  const catalogSpellId = String(formData.get("catalogSpellId") ?? "").trim();
  if (catalogSpellId) {
    const catalogSpell = await prisma.dndSpellCatalog.findUnique({
      where: { id: catalogSpellId },
    });
    if (!catalogSpell) {
      redirect(`/campaigns/${campaignSlug}/characters?error=invalid_spell`);
    }

    await prisma.characterSpell.create({
      data: {
        characterId,
        catalogSpellId: catalogSpell.id,
        name: catalogSpell.name,
        level: catalogSpell.level,
        school: catalogSpell.school,
        castingTime: catalogSpell.castingTime,
        range: catalogSpell.range,
        components: catalogSpell.components,
        duration: catalogSpell.duration,
        description: catalogSpell.description,
      },
    });
  } else {
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2) {
      redirect(`/campaigns/${campaignSlug}/characters?error=invalid_spell`);
    }
    await prisma.characterSpell.create({
      data: {
        characterId,
        name,
        level: Number(formData.get("level") ?? 0) || 0,
        school: String(formData.get("school") ?? "").trim() || null,
        castingTime: String(formData.get("castingTime") ?? "").trim() || null,
        range: String(formData.get("range") ?? "").trim() || null,
        components: String(formData.get("components") ?? "").trim() || null,
        duration: String(formData.get("duration") ?? "").trim() || null,
        description: String(formData.get("description") ?? "").trim(),
      },
    });
  }

  revalidatePath(`/campaigns/${campaignSlug}/characters`);
}

export async function addCharacterItemAction(campaignSlug: string, formData: FormData) {
  const characterId = String(formData.get("characterId") ?? "").trim();
  if (!characterId) {
    redirect(`/campaigns/${campaignSlug}/characters?error=invalid_item`);
  }

  await requireEditableCharacter(campaignSlug, characterId);

  const catalogItemId = String(formData.get("catalogItemId") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);

  if (catalogItemId) {
    const catalogItem = await prisma.dndItemCatalog.findUnique({
      where: { id: catalogItemId },
    });
    if (!catalogItem) {
      redirect(`/campaigns/${campaignSlug}/characters?error=invalid_item`);
    }

    await prisma.characterInventoryItem.create({
      data: {
        characterId,
        catalogItemId: catalogItem.id,
        name: catalogItem.name,
        description: catalogItem.description,
        quantity: Number.isNaN(quantity) ? 1 : Math.max(1, quantity),
      },
    });
  } else {
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2) {
      redirect(`/campaigns/${campaignSlug}/characters?error=invalid_item`);
    }
    await prisma.characterInventoryItem.create({
      data: {
        characterId,
        name,
        description: String(formData.get("description") ?? "").trim(),
        quantity: Number.isNaN(quantity) ? 1 : Math.max(1, quantity),
      },
    });
  }

  revalidatePath(`/campaigns/${campaignSlug}/characters`);
}

export async function createPlayerNoteAction(campaignSlug: string, formData: FormData) {
  const { user, access } = await requireCampaignMember(campaignSlug);

  const parsed = playerNoteCreateSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    characterId: formData.get("characterId"),
  });

  if (!parsed.success) {
    redirect(`/campaigns/${campaignSlug}/notes?error=invalid_note`);
  }

  const characterId = parsed.data.characterId?.trim() ? parsed.data.characterId.trim() : null;
  if (characterId) {
    const relatedCharacter = await prisma.character.findFirst({
      where: {
        id: characterId,
        campaignId: access.campaign.id,
        ownerUserId: user.id,
      },
      select: { id: true },
    });

    if (!relatedCharacter) {
      redirect(`/campaigns/${campaignSlug}/notes?error=invalid_character_ref`);
    }
  }

  await prisma.playerNote.create({
    data: {
      campaignId: access.campaign.id,
      ownerUserId: user.id,
      characterId,
      title: parsed.data.title.trim(),
      content: parsed.data.content.trim(),
      visibility: Visibility.OWNED_PRIVATE,
    },
  });

  revalidatePath(`/campaigns/${campaignSlug}/notes`);
}

export async function deletePlayerNoteAction(campaignSlug: string, noteId: string) {
  const { user, access } = await requireCampaignMember(campaignSlug);
  const note = await prisma.playerNote.findUnique({
    where: { id: noteId },
    select: {
      id: true,
      ownerUserId: true,
      campaignId: true,
    },
  });

  if (!note || note.campaignId !== access.campaign.id) {
    notFound();
  }

  if (access.membership.role !== CampaignRole.MASTER && note.ownerUserId !== user.id) {
    redirect(`/campaigns/${campaignSlug}/notes?error=forbidden`);
  }

  await prisma.playerNote.delete({ where: { id: note.id } });
  revalidatePath(`/campaigns/${campaignSlug}/notes`);
}

export async function createWikiQuickLinkAction(campaignSlug: string, formData: FormData) {
  const { user, access } = await requireCampaignMember(campaignSlug);
  if (access.membership.role !== CampaignRole.MASTER) {
    redirect(`/campaigns/${campaignSlug}/wiki?error=forbidden`);
  }

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3) {
    redirect(`/campaigns/${campaignSlug}/wiki?error=invalid_wiki_input`);
  }

  const baseSlug = slugify(title) || "untitled";
  let finalSlug = baseSlug;
  let index = 1;

  while (
    await prisma.wikiPage.findUnique({
      where: {
        campaignId_slug: {
          campaignId: access.campaign.id,
          slug: finalSlug,
        },
      },
      select: { id: true },
    })
  ) {
    index += 1;
    finalSlug = `${baseSlug}-${index}`;
  }

  await prisma.wikiPage.create({
    data: {
      campaignId: access.campaign.id,
      title,
      slug: finalSlug,
      content: "New page.",
      visibility: Visibility.PUBLIC_CAMPAIGN,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  revalidatePath(`/campaigns/${campaignSlug}/wiki`);
  redirect(`/campaigns/${campaignSlug}/wiki/${finalSlug}`);
}
