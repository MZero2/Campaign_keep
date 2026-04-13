import { PrismaClient, CampaignRole, Visibility, QuestStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import {
  DND_2024_ACTIONS,
  DND_2024_BASE_ITEMS,
  DND_2024_BASE_SPELLS,
  DND_2024_CLASS_FEATURES,
  DND_2024_CLASS_METADATA,
  DND_2024_CLASSES,
  DND_2024_FEATS,
  DND_2024_SUBCLASSES,
} from "../src/lib/dnd2024";

const prisma = new PrismaClient();

async function syncDndReferenceCatalog() {
  const systemKey = "DND_2024";
  const classIdByName = new Map<string, string>();
  const subclassIdByName = new Map<string, string>();

  for (const classEntry of DND_2024_CLASSES) {
    const metadata = DND_2024_CLASS_METADATA[classEntry.label];
    const classRow = await prisma.dndClassCatalog.upsert({
      where: {
        systemKey_name: {
          systemKey,
          name: classEntry.label,
        },
      },
      update: {
        hitDie: classEntry.hitDie,
        primaryAbility: metadata?.primaryAbility ?? null,
        spellcastingAbility: metadata?.spellcastingAbility ?? null,
        savingThrowProficiencies: metadata?.savingThrowProficiencies ?? [],
        subclassUnlockLevel: metadata?.subclassUnlockLevel ?? 3,
      },
      create: {
        systemKey,
        name: classEntry.label,
        hitDie: classEntry.hitDie,
        primaryAbility: metadata?.primaryAbility ?? null,
        spellcastingAbility: metadata?.spellcastingAbility ?? null,
        savingThrowProficiencies: metadata?.savingThrowProficiencies ?? [],
        subclassUnlockLevel: metadata?.subclassUnlockLevel ?? 3,
      },
    });
    classIdByName.set(classEntry.label, classRow.id);

    const subclasses = DND_2024_SUBCLASSES[classEntry.label] ?? [];
    for (const subclassName of subclasses) {
      const subclassRow = await prisma.dndSubclassCatalog.upsert({
        where: {
          classId_name: {
            classId: classRow.id,
            name: subclassName,
          },
        },
        update: {
          description: null,
          role: null,
        },
        create: {
          classId: classRow.id,
          name: subclassName,
          description: null,
          role: null,
        },
      });
      subclassIdByName.set(subclassName, subclassRow.id);
    }

    await prisma.dndSubclassCatalog.deleteMany({
      where: {
        classId: classRow.id,
        name: {
          notIn: subclasses,
        },
      },
    });
  }

  const classNames = DND_2024_CLASSES.map((entry) => entry.label);
  await prisma.dndClassCatalog.deleteMany({
    where: {
      systemKey,
      name: {
        notIn: classNames,
      },
    },
  });

  for (const feat of DND_2024_FEATS) {
    await prisma.dndFeatCatalog.upsert({
      where: {
        systemKey_name: {
          systemKey,
          name: feat.name,
        },
      },
      update: {
        category: feat.category,
        source: "PHB 2024",
      },
      create: {
        systemKey,
        name: feat.name,
        category: feat.category,
        source: "PHB 2024",
      },
    });
  }

  await prisma.dndFeatCatalog.deleteMany({
    where: {
      systemKey,
      name: {
        notIn: DND_2024_FEATS.map((feat) => feat.name),
      },
    },
  });

  for (const action of DND_2024_ACTIONS) {
    await prisma.dndActionCatalog.upsert({
      where: {
        systemKey_name: {
          systemKey,
          name: action.name,
        },
      },
      update: {
        actionType: action.actionType,
        description: action.description,
      },
      create: {
        systemKey,
        name: action.name,
        actionType: action.actionType,
        description: action.description,
        source: "PHB 2024",
      },
    });
  }

  await prisma.dndActionCatalog.deleteMany({
    where: {
      systemKey,
      name: {
        notIn: DND_2024_ACTIONS.map((action) => action.name),
      },
    },
  });

  for (const spell of DND_2024_BASE_SPELLS) {
    await prisma.dndSpellCatalog.upsert({
      where: {
        systemKey_name: {
          systemKey,
          name: spell.name,
        },
      },
      update: {
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime,
        range: spell.range,
        components: spell.components,
        duration: spell.duration,
        description: spell.description,
        damage: spell.damage ?? null,
        damageType: spell.damageType ?? null,
        saveAbility: spell.saveAbility ?? null,
        attackType: spell.attackType ?? null,
        scaling: spell.scaling ?? null,
        classes: spell.classes,
      },
      create: {
        systemKey,
        name: spell.name,
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime,
        range: spell.range,
        components: spell.components,
        duration: spell.duration,
        description: spell.description,
        damage: spell.damage ?? null,
        damageType: spell.damageType ?? null,
        saveAbility: spell.saveAbility ?? null,
        attackType: spell.attackType ?? null,
        scaling: spell.scaling ?? null,
        classes: spell.classes,
        source: "PHB 2024",
      },
    });
  }

  await prisma.dndSpellCatalog.deleteMany({
    where: {
      systemKey,
      name: {
        notIn: DND_2024_BASE_SPELLS.map((spell) => spell.name),
      },
    },
  });

  for (const item of DND_2024_BASE_ITEMS) {
    await prisma.dndItemCatalog.upsert({
      where: {
        systemKey_name: {
          systemKey,
          name: item.name,
        },
      },
      update: {
        category: item.category,
        rarity: item.rarity ?? null,
        costCp: item.costCp ?? null,
        weightLb: item.weightLb ?? null,
        description: item.description,
        damage: item.damage ?? null,
        damageType: item.damageType ?? null,
        acBonus: item.acBonus ?? null,
        properties: item.properties ?? [],
      },
      create: {
        systemKey,
        name: item.name,
        category: item.category,
        rarity: item.rarity ?? null,
        costCp: item.costCp ?? null,
        weightLb: item.weightLb ?? null,
        description: item.description,
        damage: item.damage ?? null,
        damageType: item.damageType ?? null,
        acBonus: item.acBonus ?? null,
        properties: item.properties ?? [],
        source: "PHB 2024",
      },
    });
  }

  await prisma.dndItemCatalog.deleteMany({
    where: {
      systemKey,
      name: {
        notIn: DND_2024_BASE_ITEMS.map((item) => item.name),
      },
    },
  });

  for (const feature of DND_2024_CLASS_FEATURES) {
    const classId = feature.className ? classIdByName.get(feature.className) : null;
    const subclassId = feature.subclassName ? subclassIdByName.get(feature.subclassName) : null;

    if (feature.className && !classId) continue;
    if (feature.subclassName && !subclassId) continue;

    await prisma.dndClassFeatureCatalog.upsert({
      where: {
        id: `${systemKey}-${feature.className ?? "no-class"}-${feature.subclassName ?? "no-subclass"}-${feature.name}-${feature.level}`
          .replace(/\s+/g, "-")
          .toLowerCase(),
      },
      update: {
        classId,
        subclassId,
        actionType: feature.actionType ?? null,
        description: feature.description,
        level: feature.level,
        source: "PHB 2024",
      },
      create: {
        id: `${systemKey}-${feature.className ?? "no-class"}-${feature.subclassName ?? "no-subclass"}-${feature.name}-${feature.level}`
          .replace(/\s+/g, "-")
          .toLowerCase(),
        systemKey,
        classId,
        subclassId,
        name: feature.name,
        level: feature.level,
        actionType: feature.actionType ?? null,
        description: feature.description,
        source: "PHB 2024",
      },
    });
  }
}

async function main() {
  const masterPasswordHash = await hash("demo1234", 10);
  const playerPasswordHash = await hash("demo1234", 10);

  const master = await prisma.user.upsert({
    where: { email: "master@campaignkeep.dev" },
    update: {
      displayName: "Aldric the Loremaster",
      passwordHash: masterPasswordHash,
      masterPlanActive: true,
    },
    create: {
      email: "master@campaignkeep.dev",
      displayName: "Aldric the Loremaster",
      passwordHash: masterPasswordHash,
      masterPlanActive: true,
    },
  });

  const player = await prisma.user.upsert({
    where: { email: "player@campaignkeep.dev" },
    update: {
      displayName: "Mira Stonesong",
      passwordHash: playerPasswordHash,
      masterPlanActive: false,
    },
    create: {
      email: "player@campaignkeep.dev",
      displayName: "Mira Stonesong",
      passwordHash: playerPasswordHash,
      masterPlanActive: false,
    },
  });

  await syncDndReferenceCatalog();

  const campaign = await prisma.campaign.upsert({
    where: { slug: "the-ember-crown" },
    update: {
      title: "The Ember Crown",
      description: "A realm of ash, old gods, and a crown that should remain buried.",
      ownerId: master.id,
    },
    create: {
      ownerId: master.id,
      title: "The Ember Crown",
      slug: "the-ember-crown",
      description: "A realm of ash, old gods, and a crown that should remain buried.",
      coverUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
    },
  });

  await prisma.campaignMember.upsert({
    where: {
      campaignId_userId: {
        campaignId: campaign.id,
        userId: master.id,
      },
    },
    update: { role: CampaignRole.MASTER },
    create: {
      campaignId: campaign.id,
      userId: master.id,
      role: CampaignRole.MASTER,
    },
  });

  await prisma.campaignMember.upsert({
    where: {
      campaignId_userId: {
        campaignId: campaign.id,
        userId: player.id,
      },
    },
    update: { role: CampaignRole.PLAYER },
    create: {
      campaignId: campaign.id,
      userId: player.id,
      role: CampaignRole.PLAYER,
    },
  });

  await prisma.campaignInvite.upsert({
    where: { token: "EMBER-OPEN-SEAT" },
    update: {
      campaignId: campaign.id,
      invitedById: master.id,
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
      role: CampaignRole.PLAYER,
      acceptedAt: null,
    },
    create: {
      campaignId: campaign.id,
      invitedById: master.id,
      token: "EMBER-OPEN-SEAT",
      role: CampaignRole.PLAYER,
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
    },
  });

  const portRavenfall = await prisma.location.upsert({
    where: {
      id: "seed-location-ravenfall",
    },
    update: {},
    create: {
      id: "seed-location-ravenfall",
      campaignId: campaign.id,
      name: "Port Ravenfall",
      publicDescription: "A storm-worn harbor city where every alley trades in secrets.",
      privateNotes: "The city guard captain is secretly tied to the Ember cult.",
      discovered: true,
      visibility: Visibility.PUBLIC_CAMPAIGN,
    },
  });

  const npc = await prisma.npc.upsert({
    where: {
      id: "seed-npc-varyn",
    },
    update: {},
    create: {
      id: "seed-npc-varyn",
      campaignId: campaign.id,
      name: "Captain Varyn Hale",
      publicDescription: "A stern harbor captain with a scar across one eye.",
      privateNotes: "Accepts bribes from the Ashen Faction.",
      status: "alive",
      faction: "Harbor Watch",
      locationId: portRavenfall.id,
      visibility: Visibility.PUBLIC_CAMPAIGN,
      tags: ["guard", "harbor"],
    },
  });

  const quest = await prisma.quest.upsert({
    where: {
      id: "seed-quest-ember",
    },
    update: {},
    create: {
      id: "seed-quest-ember",
      campaignId: campaign.id,
      title: "The Ember Crown",
      summary: "Find the relic before the Ashen Faction reaches the buried vault.",
      description: "The players must retrieve three sigils that unlock the subterranean vault.",
      status: QuestStatus.ACTIVE,
      visibility: Visibility.PUBLIC_CAMPAIGN,
      objectives: [
        "Interrogate Captain Hale",
        "Reach the Sunken Chapel",
        "Recover the first sigil",
      ],
      rewards: ["Royal favor", "300 gp"],
    },
  });

  const session = await prisma.campaignSession.upsert({
    where: {
      campaignId_number: {
        campaignId: campaign.id,
        number: 1,
      },
    },
    update: {
      title: "Ashes at Dawn",
    },
    create: {
      campaignId: campaign.id,
      number: 1,
      title: "Ashes at Dawn",
      playedAt: new Date("2026-03-03T20:00:00.000Z"),
      publicRecap: "The party arrived in Port Ravenfall and uncovered a cult symbol.",
      privateNotes: "Foreshadowed the hidden chamber under the cathedral.",
      createdById: master.id,
    },
  });

  await prisma.wikiPage.upsert({
    where: {
      campaignId_slug: {
        campaignId: campaign.id,
        slug: "ashen-faction",
      },
    },
    update: {
      title: "Ashen Faction",
    },
    create: {
      campaignId: campaign.id,
      title: "Ashen Faction",
      slug: "ashen-faction",
      content:
        "The Ashen Faction is an underground coalition of nobles, smugglers, and cultists.\n\nThey seek relics tied to ember magic and leverage city unrest to hide their moves.",
      tags: ["faction", "lore"],
      visibility: Visibility.PUBLIC_CAMPAIGN,
      createdBy: master.id,
      updatedBy: master.id,
    },
  });

  await prisma.wikiPage.upsert({
    where: {
      campaignId_slug: {
        campaignId: campaign.id,
        slug: "crown-true-origin",
      },
    },
    update: {},
    create: {
      campaignId: campaign.id,
      title: "Crown - True Origin",
      slug: "crown-true-origin",
      content:
        "Private master note: the Ember Crown is not royal regalia, but a planar seal forged by an exiled archmage.",
      tags: ["secret", "master"],
      visibility: Visibility.PRIVATE_MASTER,
      createdBy: master.id,
      updatedBy: master.id,
    },
  });

  const bardClass = await prisma.dndClassCatalog.findUnique({
    where: {
      systemKey_name: {
        systemKey: "DND_2024",
        name: "Bard",
      },
    },
    select: { id: true },
  });

  const loreSubclass = await prisma.dndSubclassCatalog.findFirst({
    where: {
      name: "College of Lore",
      classRef: {
        systemKey: "DND_2024",
      },
    },
    select: { id: true },
  });

  const character = await prisma.character.upsert({
    where: {
      id: "seed-character-mira",
    },
    update: {
      classCatalogId: bardClass?.id ?? null,
      subclassCatalogId: loreSubclass?.id ?? null,
      className: "Bard",
      subclassName: "College of Lore",
      level: 3,
    },
    create: {
      id: "seed-character-mira",
      campaignId: campaign.id,
      ownerUserId: player.id,
      classCatalogId: bardClass?.id ?? null,
      subclassCatalogId: loreSubclass?.id ?? null,
      name: "Mira Stonesong",
      className: "Bard",
      subclassName: "College of Lore",
      level: 3,
      raceName: "Half-Elf",
      background: "Sage",
      alignment: "Neutral Good",
      notes: "Collector of old songs and forbidden scripts.",
      visibility: Visibility.PUBLIC_CAMPAIGN,
    },
  });

  await prisma.characterStats.upsert({
    where: { characterId: character.id },
    update: {},
    create: {
      characterId: character.id,
      str: 8,
      dex: 14,
      con: 12,
      int: 15,
      wis: 10,
      cha: 17,
      hpCurrent: 21,
      hpMax: 21,
      ac: 14,
      speed: 30,
      initiativeBonus: 2,
      proficiencyBonus: 2,
    },
  });

  await prisma.characterInventoryItem.deleteMany({
    where: { characterId: character.id },
  });

  const rapierCatalog = await prisma.dndItemCatalog.findUnique({
    where: {
      systemKey_name: {
        systemKey: "DND_2024",
        name: "Rapier",
      },
    },
    select: { id: true },
  });

  const healingPotionCatalog = await prisma.dndItemCatalog.findUnique({
    where: {
      systemKey_name: {
        systemKey: "DND_2024",
        name: "Potion of Healing",
      },
    },
    select: { id: true },
  });

  await prisma.characterInventoryItem.createMany({
    data: [
      {
        characterId: character.id,
        catalogItemId: rapierCatalog?.id ?? null,
        name: "Rapier",
        quantity: 1,
        equipped: true,
      },
      {
        characterId: character.id,
        name: "Lute",
        quantity: 1,
      },
      {
        characterId: character.id,
        catalogItemId: healingPotionCatalog?.id ?? null,
        name: "Healing Potion",
        quantity: 2,
      },
    ],
  });

  await prisma.characterSpell.deleteMany({
    where: { characterId: character.id },
  });

  const healingWordCatalog = await prisma.dndSpellCatalog.findUnique({
    where: {
      systemKey_name: {
        systemKey: "DND_2024",
        name: "Healing Word",
      },
    },
    select: { id: true },
  });

  const dissonantWhispersCatalog = await prisma.dndSpellCatalog.findUnique({
    where: {
      systemKey_name: {
        systemKey: "DND_2024",
        name: "Dissonant Whispers",
      },
    },
    select: { id: true },
  });

  await prisma.characterSpell.createMany({
    data: [
      {
        characterId: character.id,
        catalogSpellId: healingWordCatalog?.id ?? null,
        name: "Healing Word",
        level: 1,
        school: "Evocation",
        castingTime: "1 bonus action",
        range: "60 ft",
        components: "V",
        duration: "Instantaneous",
      },
      {
        characterId: character.id,
        catalogSpellId: dissonantWhispersCatalog?.id ?? null,
        name: "Dissonant Whispers",
        level: 1,
        school: "Enchantment",
        castingTime: "1 action",
        range: "60 ft",
        components: "V",
        duration: "Instantaneous",
      },
    ],
  });

  await prisma.characterAttack.deleteMany({
    where: { characterId: character.id },
  });

  await prisma.characterAttack.createMany({
    data: [
      {
        characterId: character.id,
        name: "Rapier",
        ability: "DEX",
        attackBonus: 4,
        damageDice: "1d8+2",
        damageType: "Piercing",
      },
      {
        characterId: character.id,
        name: "Vicious Mockery",
        ability: "CHA",
        attackBonus: 5,
        damageDice: "1d4",
        damageType: "Psychic",
      },
    ],
  });

  await prisma.characterAction.deleteMany({
    where: { characterId: character.id },
  });

  await prisma.characterAction.createMany({
    data: [
      {
        characterId: character.id,
        name: "Bardic Inspiration",
        actionType: "Bonus Action",
        description: "Grant an inspiration die to an ally.",
        source: "Class Feature",
      },
      {
        characterId: character.id,
        name: "Attack",
        actionType: "Action",
        description: "Make one weapon attack.",
        source: "Core Rules",
      },
    ],
  });

  await prisma.characterFeature.deleteMany({
    where: { characterId: character.id },
  });

  const bardFeatures = await prisma.dndClassFeatureCatalog.findMany({
    where: {
      OR: [{ classRef: { name: "Bard", systemKey: "DND_2024" } }, { subclassRef: { name: "College of Lore" } }],
      level: { lte: 3 },
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  for (const feature of bardFeatures) {
    await prisma.characterFeature.create({
      data: {
        characterId: character.id,
        catalogFeatureId: feature.id,
        name: feature.name,
        level: feature.level,
        actionType: feature.actionType,
        description: feature.description,
        source: feature.source,
      },
    });
  }

  await prisma.characterFeat.deleteMany({
    where: { characterId: character.id },
  });

  await prisma.characterFeat.createMany({
    data: [
      {
        characterId: character.id,
        name: "Magic Initiate",
        category: "Origin",
      },
      {
        characterId: character.id,
        name: "Musician",
        category: "Origin",
      },
    ],
  });

  await prisma.handout.upsert({
    where: { id: "seed-handout-1" },
    update: {},
    create: {
      id: "seed-handout-1",
      campaignId: campaign.id,
      title: "Harbor Map Fragment",
      description: "A scorched fragment showing old catacomb entrances.",
      fileUrl: "/demo/harbor-map-fragment.pdf",
      fileType: "application/pdf",
      visibility: Visibility.PUBLIC_CAMPAIGN,
      uploadedById: master.id,
      tags: ["map", "session1"],
    },
  });

  await prisma.playerNote.upsert({
    where: { id: "seed-note-mira-1" },
    update: {},
    create: {
      id: "seed-note-mira-1",
      campaignId: campaign.id,
      ownerUserId: player.id,
      characterId: character.id,
      title: "About Captain Hale",
      content: "He flinched when I sang the old ember hymn. Need to press this next session.",
      visibility: Visibility.OWNED_PRIVATE,
    },
  });

  await prisma.campaignSession.update({
    where: { id: session.id },
    data: {
      npcs: { connect: [{ id: npc.id }] },
      locations: { connect: [{ id: portRavenfall.id }] },
      quests: { connect: [{ id: quest.id }] },
    },
  });

  await prisma.quest.update({
    where: { id: quest.id },
    data: {
      npcs: { connect: [{ id: npc.id }] },
      locations: { connect: [{ id: portRavenfall.id }] },
    },
  });

  console.log("Seed complete.");
  console.log("Master login: master@campaignkeep.dev / demo1234");
  console.log("Player login: player@campaignkeep.dev / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
