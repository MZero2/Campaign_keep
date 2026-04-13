import Link from "next/link";
import { notFound } from "next/navigation";

import { AttackRollCard } from "@/components/attack-roll-card";
import { Button } from "@/components/ui/button";
import { requireCampaignContext } from "@/lib/campaign";
import { abilityModifier, getClassTheme } from "@/lib/dnd2024";
import { prisma } from "@/lib/prisma";

type CharacterSheetPageProps = {
  params: Promise<{ slug: string; characterId: string }>;
};

function jsonArrayToStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

export default async function CharacterSheetPage({ params }: CharacterSheetPageProps) {
  const { slug, characterId } = await params;
  const { access, sessionUser } = await requireCampaignContext(slug);

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      campaignId: access.campaign.id,
      ...(access.isMaster ? {} : { OR: [{ visibility: "PUBLIC_CAMPAIGN" }, { ownerUserId: sessionUser.id }] }),
    },
    include: {
      ownerUser: { select: { displayName: true } },
      stats: true,
      feats: { orderBy: [{ category: "asc" }, { name: "asc" }] },
      features: { orderBy: [{ level: "asc" }, { name: "asc" }] },
      attacks: { orderBy: { createdAt: "asc" } },
      actions: { orderBy: [{ actionType: "asc" }, { name: "asc" }] },
      spells: { orderBy: [{ level: "asc" }, { name: "asc" }] },
      inventory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!character) notFound();

  const canEdit = access.isMaster || character.ownerUserId === sessionUser.id;
  const theme = getClassTheme(character.className);
  const skills = jsonArrayToStrings(character.stats?.skills);
  const saves = jsonArrayToStrings(character.stats?.savingThrows);

  return (
    <div className={`space-y-6 rounded-[34px] border p-6 sm:p-8 ${theme.cardClass}`}>
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0.18)_100%)] p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-200/65">Character Sheet</p>
            <h1 className={`font-heading text-4xl sm:text-5xl ${theme.accentClass}`}>{character.name}</h1>
            <p className="mt-3 text-base text-neutral-200">
              Lv. {character.level} {character.className ?? "Adventurer"}
              {character.subclassName ? ` · ${character.subclassName}` : ""}
            </p>
            <p className="text-sm text-neutral-400">
              {character.raceName ?? "Unknown species"} · {character.background ?? "No origin set"} · Owner {character.ownerUser.displayName}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href={`/campaigns/${slug}/characters`}>Back to roster</Link>
            </Button>
            {canEdit ? (
              <Button asChild>
                <Link href={`/campaigns/${slug}/characters/${character.id}/edit`}>Edit build</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              ["STR", character.stats?.str ?? 10],
              ["DEX", character.stats?.dex ?? 10],
              ["CON", character.stats?.con ?? 10],
              ["INT", character.stats?.int ?? 10],
              ["WIS", character.stats?.wis ?? 10],
              ["CHA", character.stats?.cha ?? 10],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[28px] border border-white/10 bg-black/20 p-4 text-center">
                <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">{label}</p>
                <p className="mt-2 font-heading text-4xl text-white">{value}</p>
                <p className="text-sm text-neutral-400">
                  {abilityModifier(Number(value)) >= 0 ? "+" : ""}
                  {abilityModifier(Number(value))}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Armor Class</p>
              <p className="mt-2 font-heading text-3xl text-white">{character.stats?.ac ?? "?"}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Hit Points</p>
              <p className="mt-2 font-heading text-3xl text-white">
                {character.stats?.hpCurrent ?? "?"}/{character.stats?.hpMax ?? "?"}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Initiative</p>
              <p className="mt-2 font-heading text-3xl text-white">
                {(character.stats?.initiativeBonus ?? 0) >= 0 ? "+" : ""}
                {character.stats?.initiativeBonus ?? 0}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Speed</p>
              <p className="mt-2 font-heading text-3xl text-white">{character.stats?.speed ?? "?"}</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Saving Throws</p>
            <p className="mt-3 text-sm text-neutral-200">{saves.length ? saves.join(" · ") : "None recorded"}</p>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Skills</p>
            <p className="mt-3 text-sm text-neutral-200">{skills.length ? skills.join(" · ") : "None recorded"}</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Attacks & Actions</p>
            <div className="mt-4 space-y-3">
              {character.attacks.length === 0 && character.actions.length === 0 ? (
                <p className="text-sm text-neutral-400">No actions recorded.</p>
              ) : null}
              {character.attacks.map((attack) => (
                <AttackRollCard
                  key={attack.id}
                  name={attack.name}
                  attackBonus={attack.attackBonus}
                  damageDice={attack.damageDice}
                  damageType={attack.damageType}
                />
              ))}
              {character.actions.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{entry.name}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">{entry.actionType}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-300">{entry.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Features & Feats</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {character.features.map((feature) => (
                <div key={feature.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{feature.name}</p>
                  <p className="text-xs text-neutral-500">Level {feature.level ?? "?"}</p>
                  <p className="mt-2 text-sm text-neutral-300">{feature.description}</p>
                </div>
              ))}
              {character.feats.map((feat) => (
                <div key={feat.id} className="rounded-2xl border border-emerald-300/12 bg-emerald-300/7 p-4">
                  <p className="font-medium text-white">{feat.name}</p>
                  <p className="text-xs text-neutral-500">{feat.category}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Spells</p>
              <div className="mt-4 space-y-3">
                {character.spells.length === 0 ? <p className="text-sm text-neutral-400">No spells known.</p> : null}
                {character.spells.map((spell) => (
                  <div key={spell.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-medium text-white">{spell.name}</p>
                    <p className="text-xs text-neutral-500">
                      Level {spell.level} · {spell.school ?? "Unknown school"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Inventory</p>
              <div className="mt-4 space-y-3">
                {character.inventory.length === 0 ? <p className="text-sm text-neutral-400">Inventory empty.</p> : null}
                {character.inventory.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-white">
                      {item.name} <span className="text-neutral-500">x{item.quantity}</span>
                    </p>
                    {item.description ? <p className="mt-1 text-sm text-neutral-300">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
