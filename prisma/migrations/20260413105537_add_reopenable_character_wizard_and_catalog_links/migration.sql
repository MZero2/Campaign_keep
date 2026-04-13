-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "classCatalogId" TEXT,
ADD COLUMN     "subclassCatalogId" TEXT;

-- AlterTable
ALTER TABLE "CharacterInventoryItem" ADD COLUMN     "catalogItemId" TEXT;

-- AlterTable
ALTER TABLE "CharacterSpell" ADD COLUMN     "catalogSpellId" TEXT;

-- AlterTable
ALTER TABLE "DndClassCatalog" ADD COLUMN     "primaryAbility" TEXT,
ADD COLUMN     "savingThrowProficiencies" JSONB,
ADD COLUMN     "spellcastingAbility" TEXT,
ADD COLUMN     "subclassUnlockLevel" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "DndSubclassCatalog" ADD COLUMN     "description" TEXT,
ADD COLUMN     "role" TEXT;

-- CreateTable
CREATE TABLE "DndActionCatalog" (
    "id" TEXT NOT NULL,
    "systemKey" TEXT NOT NULL DEFAULT 'DND_2024',
    "name" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'PHB 2024',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DndActionCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndSpellCatalog" (
    "id" TEXT NOT NULL,
    "systemKey" TEXT NOT NULL DEFAULT 'DND_2024',
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT NOT NULL,
    "castingTime" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "components" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "damage" TEXT,
    "damageType" TEXT,
    "saveAbility" TEXT,
    "attackType" TEXT,
    "scaling" TEXT,
    "classes" JSONB,
    "source" TEXT NOT NULL DEFAULT 'PHB 2024',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DndSpellCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndItemCatalog" (
    "id" TEXT NOT NULL,
    "systemKey" TEXT NOT NULL DEFAULT 'DND_2024',
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rarity" TEXT,
    "costCp" INTEGER,
    "weightLb" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "damage" TEXT,
    "damageType" TEXT,
    "acBonus" INTEGER,
    "properties" JSONB,
    "source" TEXT NOT NULL DEFAULT 'PHB 2024',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DndItemCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndClassFeatureCatalog" (
    "id" TEXT NOT NULL,
    "systemKey" TEXT NOT NULL DEFAULT 'DND_2024',
    "classId" TEXT,
    "subclassId" TEXT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "actionType" TEXT,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'PHB 2024',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DndClassFeatureCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterFeature" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "catalogFeatureId" TEXT,
    "name" TEXT NOT NULL,
    "level" INTEGER,
    "actionType" TEXT,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Character Sheet',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAttack" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ability" TEXT,
    "attackBonus" INTEGER,
    "damageDice" TEXT,
    "damageType" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterAttack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAction" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Character Sheet',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DndActionCatalog_systemKey_actionType_idx" ON "DndActionCatalog"("systemKey", "actionType");

-- CreateIndex
CREATE UNIQUE INDEX "DndActionCatalog_systemKey_name_key" ON "DndActionCatalog"("systemKey", "name");

-- CreateIndex
CREATE INDEX "DndSpellCatalog_systemKey_level_idx" ON "DndSpellCatalog"("systemKey", "level");

-- CreateIndex
CREATE UNIQUE INDEX "DndSpellCatalog_systemKey_name_key" ON "DndSpellCatalog"("systemKey", "name");

-- CreateIndex
CREATE INDEX "DndItemCatalog_systemKey_category_idx" ON "DndItemCatalog"("systemKey", "category");

-- CreateIndex
CREATE UNIQUE INDEX "DndItemCatalog_systemKey_name_key" ON "DndItemCatalog"("systemKey", "name");

-- CreateIndex
CREATE INDEX "DndClassFeatureCatalog_systemKey_level_idx" ON "DndClassFeatureCatalog"("systemKey", "level");

-- CreateIndex
CREATE INDEX "DndClassFeatureCatalog_classId_level_idx" ON "DndClassFeatureCatalog"("classId", "level");

-- CreateIndex
CREATE INDEX "DndClassFeatureCatalog_subclassId_level_idx" ON "DndClassFeatureCatalog"("subclassId", "level");

-- CreateIndex
CREATE INDEX "CharacterFeature_characterId_level_idx" ON "CharacterFeature"("characterId", "level");

-- CreateIndex
CREATE INDEX "CharacterAttack_characterId_createdAt_idx" ON "CharacterAttack"("characterId", "createdAt");

-- CreateIndex
CREATE INDEX "CharacterAction_characterId_actionType_idx" ON "CharacterAction"("characterId", "actionType");

-- AddForeignKey
ALTER TABLE "DndClassFeatureCatalog" ADD CONSTRAINT "DndClassFeatureCatalog_classId_fkey" FOREIGN KEY ("classId") REFERENCES "DndClassCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DndClassFeatureCatalog" ADD CONSTRAINT "DndClassFeatureCatalog_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "DndSubclassCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_classCatalogId_fkey" FOREIGN KEY ("classCatalogId") REFERENCES "DndClassCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_subclassCatalogId_fkey" FOREIGN KEY ("subclassCatalogId") REFERENCES "DndSubclassCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeature" ADD CONSTRAINT "CharacterFeature_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeature" ADD CONSTRAINT "CharacterFeature_catalogFeatureId_fkey" FOREIGN KEY ("catalogFeatureId") REFERENCES "DndClassFeatureCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAttack" ADD CONSTRAINT "CharacterAttack_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAction" ADD CONSTRAINT "CharacterAction_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterInventoryItem" ADD CONSTRAINT "CharacterInventoryItem_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "DndItemCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSpell" ADD CONSTRAINT "CharacterSpell_catalogSpellId_fkey" FOREIGN KEY ("catalogSpellId") REFERENCES "DndSpellCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
