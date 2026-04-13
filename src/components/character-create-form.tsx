"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Dice6, Shield, Sparkles, Sword, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ABILITY_KEYS,
  type AbilityKey,
  abilityLabel,
  DND_2024_CLASS_LOADOUTS,
  DND_2024_CLASS_SKILL_RULES,
  DND_2024_ORIGINS,
  DND_2024_SPECIES,
  getClassTheme,
  slugifyCatalogName,
} from "@/lib/dnd2024";
import { cn } from "@/lib/utils";

type ClassCatalog = {
  id: string;
  name: string;
  hitDie: number;
  primaryAbility: string | null;
  spellcastingAbility: string | null;
  savingThrowProficiencies: string[];
  subclassUnlockLevel: number;
  subclasses: Array<{ id: string; name: string }>;
};

type FeatCatalog = { id: string; name: string; category: string };
type SpellCatalog = { id: string; name: string; level: number; school: string; damage: string | null; damageType: string | null };
type ItemCatalog = { id: string; name: string; category: string; damage: string | null; damageType: string | null; acBonus: number | null };
type ActionCatalog = { id: string; name: string; actionType: string };

type CharacterWizardInitialValues = {
  name: string;
  classCatalogId: string;
  subclassCatalogId: string | null;
  raceName: string;
  background: string | null;
  alignment: string | null;
  level: number;
  visibility: "PUBLIC_CAMPAIGN" | "OWNED_PRIVATE";
  armorBonus: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  skillProficiencies: string[];
  featNames: string[];
  selectedSpellIds: string[];
  selectedItemIds: string[];
};

type CharacterCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  classes: ClassCatalog[];
  feats: FeatCatalog[];
  spells: SpellCatalog[];
  items: ItemCatalog[];
  coreActions: ActionCatalog[];
  mode?: "create" | "edit";
  initialValues?: CharacterWizardInitialValues;
  submitLabel?: string;
};

type Scores = Record<AbilityKey, number>;
type StatMethod = "automatic" | "manual" | "rolled";

const baseScores: Scores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
const steps = ["Calling", "Origin", "Scores", "Loadout"];

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildScores(priority: AbilityKey[], pool = [15, 14, 13, 12, 10, 8]) {
  const next = { ...baseScores };
  priority.forEach((ability, index) => {
    next[ability] = pool[index] ?? 8;
  });
  return next;
}

function rollPool() {
  return Array.from({ length: 6 }, () => {
    const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
    return dice[0] + dice[1] + dice[2];
  }).sort((a, b) => b - a);
}

export function CharacterCreateForm({
  action,
  classes,
  feats,
  spells,
  items,
  coreActions,
  mode = "create",
  initialValues,
  submitLabel,
}: CharacterCreateFormProps) {
  const initialClass = classes.find((entry) => entry.id === initialValues?.classCatalogId) ?? classes[0];
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [selectedClassId, setSelectedClassId] = useState(initialClass?.id ?? "");
  const [selectedSubclassId, setSelectedSubclassId] = useState(initialValues?.subclassCatalogId ?? "");
  const [level, setLevel] = useState(initialValues?.level ?? 1);
  const [visibility, setVisibility] = useState<"PUBLIC_CAMPAIGN" | "OWNED_PRIVATE">(initialValues?.visibility ?? "PUBLIC_CAMPAIGN");
  const [alignment, setAlignment] = useState(initialValues?.alignment ?? "");
  const [speciesKey, setSpeciesKey] = useState(DND_2024_SPECIES.find((entry) => entry.label === initialValues?.raceName)?.key ?? DND_2024_SPECIES[0].key);
  const [originKey, setOriginKey] = useState(DND_2024_ORIGINS.find((entry) => entry.label === initialValues?.background)?.key ?? DND_2024_ORIGINS[0].key);
  const [statMethod, setStatMethod] = useState<StatMethod>(mode === "edit" ? "manual" : "automatic");
  const [scores, setScores] = useState<Scores>(
    initialValues
      ? { str: initialValues.str, dex: initialValues.dex, con: initialValues.con, int: initialValues.int, wis: initialValues.wis, cha: initialValues.cha }
      : buildScores((DND_2024_CLASS_LOADOUTS[initialClass?.name ?? "Fighter"]?.priorityAbilities ?? ABILITY_KEYS) as AbilityKey[])
  );
  const [rolling, setRolling] = useState(false);
  const [bonusMode, setBonusMode] = useState<"+2/+1" | "+1/+1/+1">("+2/+1");
  const [bonusA, setBonusA] = useState<AbilityKey>("str");
  const [bonusB, setBonusB] = useState<AbilityKey>("con");
  const [bonusThree, setBonusThree] = useState<AbilityKey[]>(["str", "dex", "con"]);
  const [classSkills, setClassSkills] = useState<string[]>(initialValues?.skillProficiencies ?? []);
  const [generalFeat, setGeneralFeat] = useState(initialValues?.featNames.find((feat) => feats.some((entry) => entry.name === feat && entry.category === "General")) ?? "");
  const [weaponId, setWeaponId] = useState(
    initialValues?.selectedItemIds.find((entry) => items.find((item) => item.id === entry)?.category === "Weapon") ?? ""
  );
  const [armorIds, setArmorIds] = useState(
    (initialValues?.selectedItemIds ?? []).filter((entry) => items.find((item) => item.id === entry)?.category === "Armor")
  );
  const [gearIds, setGearIds] = useState(
    (initialValues?.selectedItemIds ?? []).filter((entry) => {
      const category = items.find((item) => item.id === entry)?.category;
      return category && category !== "Weapon" && category !== "Armor";
    })
  );
  const [spellIds, setSpellIds] = useState<string[]>(initialValues?.selectedSpellIds ?? []);

  const selectedClass = classes.find((entry) => entry.id === selectedClassId) ?? classes[0];
  const selectedSubclass = selectedClass?.subclasses.find((entry) => entry.id === selectedSubclassId) ?? null;
  const selectedSpecies = DND_2024_SPECIES.find((entry) => entry.key === speciesKey) ?? DND_2024_SPECIES[0];
  const selectedOrigin = DND_2024_ORIGINS.find((entry) => entry.key === originKey) ?? DND_2024_ORIGINS[0];
  const theme = getClassTheme(selectedClass?.name ?? "Fighter");
  const loadout = DND_2024_CLASS_LOADOUTS[selectedClass?.name ?? "Fighter"];
  const skillRule = DND_2024_CLASS_SKILL_RULES[selectedClass?.name ?? "Fighter"] ?? { count: 2, options: [] };
  const generalFeats = feats.filter((entry) => entry.category === "General");
  const itemBySlug = new Map(items.map((entry) => [slugifyCatalogName(entry.name), entry]));
  const spellBySlug = new Map(spells.map((entry) => [slugifyCatalogName(entry.name), entry]));
  const actionByName = new Map(coreActions.map((entry) => [entry.name, entry]));

  const canUseSubclass = level >= (selectedClass?.subclassUnlockLevel ?? 3);
  const bonusScores = { ...baseScores };
  if (mode === "create") {
    if (bonusMode === "+2/+1") {
      bonusScores[bonusA] += 2;
      if (bonusB !== bonusA) bonusScores[bonusB] += 1;
    } else {
      bonusThree.forEach((entry) => {
        bonusScores[entry] += 1;
      });
    }
  }

  const finalScores = ABILITY_KEYS.reduce((acc, ability) => {
    acc[ability] = scores[ability] + bonusScores[ability];
    return acc;
  }, { ...baseScores });

  const selectedSkills = unique([...selectedOrigin.skills, ...classSkills.filter((entry) => skillRule.options.includes(entry)).slice(0, skillRule.count)]);
  const selectedFeatNames = unique([...(initialValues?.featNames ?? []), selectedOrigin.featName, level >= 4 ? generalFeat : ""]);
  const selectedItemIds = unique([weaponId, ...armorIds, ...gearIds]);
  const selectedActionIds = unique(
    ["Attack", "Dash", "Disengage", "Dodge", "Help", "Hide", "Ready", "Search", "Study", "Utilize", "Opportunity Attack", spellIds.length ? "Magic" : ""]
      .map((entry) => actionByName.get(entry)?.id ?? "")
  );
  const armorBonus = armorIds.map((entry) => items.find((item) => item.id === entry)?.acBonus ?? 0).reduce((sum, value) => sum + value, 0);
  const submitText = submitLabel ?? (mode === "edit" ? "Save Character" : "Forge Character");

  function syncForClass(nextClassId: string) {
    const nextClass = classes.find((entry) => entry.id === nextClassId) ?? classes[0];
    const nextLoadout = DND_2024_CLASS_LOADOUTS[nextClass?.name ?? "Fighter"];
    const priority = (nextLoadout?.priorityAbilities ?? ABILITY_KEYS) as AbilityKey[];

    setSelectedClassId(nextClassId);
    setSelectedSubclassId("");
    setBonusA(priority[0] ?? "str");
    setBonusB(priority[1] ?? "con");
    setBonusThree(priority.slice(0, 3));

    if (mode === "create") {
      if (statMethod === "automatic") {
        setScores(buildScores(priority));
      }
      setWeaponId(itemBySlug.get(nextLoadout?.weaponIds[0] ?? "")?.id ?? "");
      setArmorIds((nextLoadout?.armorIds ?? []).map((entry) => itemBySlug.get(entry)?.id ?? "").filter(Boolean));
      setGearIds((nextLoadout?.gearIds ?? []).map((entry) => itemBySlug.get(entry)?.id ?? "").filter(Boolean));
      setSpellIds((nextLoadout?.spellIds ?? []).map((entry) => spellBySlug.get(entry)?.id ?? "").filter(Boolean).slice(0, 4));
    }
  }

  function applyAutomatic() {
    setStatMethod("automatic");
    setScores(buildScores((loadout?.priorityAbilities ?? ABILITY_KEYS) as AbilityKey[]));
  }

  function applyRolled() {
    setRolling(true);
    window.setTimeout(() => {
      setScores(buildScores((loadout?.priorityAbilities ?? ABILITY_KEYS) as AbilityKey[], rollPool()));
      setStatMethod("rolled");
      setRolling(false);
    }, 850);
  }

  function tweakScore(ability: AbilityKey, delta: -1 | 1) {
    setStatMethod("manual");
    setScores((current) => ({ ...current, [ability]: Math.max(8, Math.min(15, current[ability] + delta)) }));
  }

  return (
    <form action={action} className={cn("-m-4 min-h-[calc(100vh-2rem)] sm:-m-6", theme.cardClass)}>
      <input type="hidden" name="classCatalogId" value={selectedClass?.id ?? ""} />
      <input type="hidden" name="className" value={selectedClass?.name ?? ""} />
      <input type="hidden" name="subclassCatalogId" value={canUseSubclass ? selectedSubclass?.id ?? "" : ""} />
      <input type="hidden" name="subclassName" value={canUseSubclass ? selectedSubclass?.name ?? "" : ""} />
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="raceName" value={selectedSpecies.label} />
      <input type="hidden" name="background" value={selectedOrigin.label} />
      <input type="hidden" name="alignment" value={alignment} />
      <input type="hidden" name="level" value={level} />
      <input type="hidden" name="visibility" value={visibility} />
      <input type="hidden" name="speed" value={selectedSpecies.speed} />
      <input type="hidden" name="armorBonus" value={armorBonus} />
      {ABILITY_KEYS.map((ability) => <input key={ability} type="hidden" name={ability} value={finalScores[ability]} />)}
      {selectedClass?.savingThrowProficiencies.map((entry) => <input key={entry} type="hidden" name="savingThrowProficiencies" value={entry} />)}
      {selectedSkills.map((entry) => <input key={entry} type="hidden" name="skillProficiencies" value={entry} />)}
      {selectedFeatNames.map((entry) => <input key={entry} type="hidden" name="feats" value={entry} />)}
      {spellIds.map((entry) => <input key={entry} type="hidden" name="spells" value={entry} />)}
      {selectedItemIds.map((entry) => <input key={entry} type="hidden" name="items" value={entry} />)}
      {selectedActionIds.map((entry) => <input key={entry} type="hidden" name="coreActions" value={entry} />)}

      <div className="grid min-h-screen lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-black/25 p-5 lg:border-b-0 lg:border-r lg:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-200/65">Campaign Keep</p>
          <h2 className="font-heading text-3xl text-white">Character Forge</h2>
          <div className="mt-8 space-y-3">
            {steps.map((entry, index) => (
              <button
                key={entry}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "block w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                  step === index ? "border-amber-300/35 bg-amber-300/10 text-white" : "border-white/10 bg-white/5 text-neutral-300"
                )}
              >
                <span className="text-xs uppercase tracking-[0.2em] text-current/60">Step {index + 1}</span>
                <p className="mt-1 font-medium">{entry}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Live Summary</p>
            <p className={cn("mt-2 font-heading text-3xl", theme.accentClass)}>{name || "Unnamed Hero"}</p>
            <p className="text-sm text-neutral-300">Lv. {level} {selectedClass?.name}{canUseSubclass && selectedSubclass ? ` · ${selectedSubclass.name}` : ""}</p>
            <p className="text-sm text-neutral-400">{selectedSpecies.label} · {selectedOrigin.label}</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {ABILITY_KEYS.map((ability) => (
                <div key={ability} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">{abilityLabel(ability)}</p>
                  <p className="font-heading text-2xl text-white">{finalScores[ability]}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="bg-[radial-gradient(circle_at_top,#f59e0b14_0%,transparent_26%),linear-gradient(180deg,#0b0f15_0%,#090c10_100%)] p-5 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-200/65">{mode === "edit" ? "Refine Sheet" : "Forge Your Hero"}</p>
            <h1 className="font-heading text-4xl text-white sm:text-5xl">{steps[step]}</h1>

            {step === 0 ? (
              <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2"><span className="text-sm text-neutral-400">Name</span><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seren Vale" /></label>
                    <label className="space-y-2"><span className="text-sm text-neutral-400">Level</span><Input type="number" min={1} max={20} value={level} onChange={(event) => setLevel(Number(event.target.value) || 1)} /></label>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {classes.map((entry) => (
                      <button key={entry.id} type="button" onClick={() => syncForClass(entry.id)} className={cn("rounded-[28px] border p-4 text-left", selectedClassId === entry.id ? `${getClassTheme(entry.name).cardClass} border-white/30` : "border-white/10 bg-black/20")}>
                        <p className="font-heading text-xl text-white">{entry.name}</p>
                        <p className="text-xs text-neutral-400">Primary {entry.primaryAbility ?? "N/A"} · d{entry.hitDie}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-[32px] border border-white/10 bg-black/20 p-6">
                  <label className="space-y-2">
                    <span className="text-sm text-neutral-400">Visibility</span>
                    <select value={visibility} onChange={(event) => setVisibility(event.target.value as "PUBLIC_CAMPAIGN" | "OWNED_PRIVATE")} className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white">
                      <option value="PUBLIC_CAMPAIGN">Public to Party</option>
                      <option value="OWNED_PRIVATE">Private to Owner</option>
                    </select>
                  </label>
                  <label className="mt-5 block space-y-2">
                    <span className="text-sm text-neutral-400">Subclass</span>
                    <select value={selectedSubclassId} onChange={(event) => setSelectedSubclassId(event.target.value)} disabled={!canUseSubclass} className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white disabled:opacity-40">
                      <option value="">None yet</option>
                      {(selectedClass?.subclasses ?? []).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="mt-8 space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-neutral-400">Species</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {DND_2024_SPECIES.map((entry) => (
                      <button key={entry.key} type="button" onClick={() => setSpeciesKey(entry.key)} className={cn("rounded-[28px] border p-5 text-left", speciesKey === entry.key ? "border-amber-300/35 bg-amber-300/10 text-white" : "border-white/10 bg-black/20 text-neutral-300")}>
                        <p className="font-heading text-2xl">{entry.label}</p>
                        <p className="mt-2 text-sm">{entry.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-[32px] border border-white/10 bg-black/20 p-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-neutral-400">Origin</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {DND_2024_ORIGINS.map((entry) => (
                      <button key={entry.key} type="button" onClick={() => setOriginKey(entry.key)} className={cn("rounded-[28px] border p-5 text-left", originKey === entry.key ? "border-emerald-300/35 bg-emerald-300/10 text-white" : "border-white/10 bg-white/5 text-neutral-300")}>
                        <p className="font-heading text-2xl">{entry.label}</p>
                        <p className="mt-2 text-sm">{entry.description}</p>
                        <p className="mt-3 text-xs text-neutral-400">Feat {entry.featName} · {entry.skills.join(", ")}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => setBonusMode("+2/+1")} className={cn("rounded-full border px-4 py-2 text-sm", bonusMode === "+2/+1" ? "border-amber-300/35 bg-amber-300/10 text-white" : "border-white/10 bg-black/20 text-neutral-300")}>+2 / +1</button>
                      <button type="button" onClick={() => setBonusMode("+1/+1/+1")} className={cn("rounded-full border px-4 py-2 text-sm", bonusMode === "+1/+1/+1" ? "border-amber-300/35 bg-amber-300/10 text-white" : "border-white/10 bg-black/20 text-neutral-300")}>+1 / +1 / +1</button>
                    </div>
                    {bonusMode === "+2/+1" ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <select value={bonusA} onChange={(event) => setBonusA(event.target.value as AbilityKey)} className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-white">{ABILITY_KEYS.map((entry) => <option key={entry} value={entry}>{abilityLabel(entry)} +2</option>)}</select>
                        <select value={bonusB} onChange={(event) => setBonusB(event.target.value as AbilityKey)} className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-white">{ABILITY_KEYS.filter((entry) => entry !== bonusA).map((entry) => <option key={entry} value={entry}>{abilityLabel(entry)} +1</option>)}</select>
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {ABILITY_KEYS.map((entry) => (
                          <button key={entry} type="button" onClick={() => setBonusThree((current) => current.includes(entry) ? current.filter((value) => value !== entry) : [...current, entry].slice(-3))} className={cn("rounded-2xl border px-4 py-3 text-sm", bonusThree.includes(entry) ? "border-emerald-300/35 bg-emerald-300/10 text-white" : "border-white/10 bg-black/20 text-neutral-300")}>{abilityLabel(entry)}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-[32px] border border-white/10 bg-black/20 p-6">
                    <label className="space-y-2">
                      <span className="text-sm text-neutral-400">Alignment</span>
                      <Input value={alignment} onChange={(event) => setAlignment(event.target.value)} placeholder="Neutral Good" />
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-8 space-y-6">
                <div className="grid gap-4 xl:grid-cols-3">
                  <button type="button" onClick={applyAutomatic} className={cn("rounded-[28px] border p-5 text-left", statMethod === "automatic" ? "border-amber-300/35 bg-amber-300/10 text-white" : "border-white/10 bg-white/5 text-neutral-300")}><Sparkles className="mb-3 h-5 w-5" /><p className="font-heading text-2xl">Automatic</p><p className="text-sm">Distribuzione consigliata per la classe.</p></button>
                  <button type="button" onClick={() => setStatMethod("manual")} className={cn("rounded-[28px] border p-5 text-left", statMethod === "manual" ? "border-amber-300/35 bg-amber-300/10 text-white" : "border-white/10 bg-white/5 text-neutral-300")}><Shield className="mb-3 h-5 w-5" /><p className="font-heading text-2xl">Manual</p><p className="text-sm">Solo step guidati tra 8 e 15.</p></button>
                  <button type="button" onClick={applyRolled} className={cn("rounded-[28px] border p-5 text-left", statMethod === "rolled" ? "border-amber-300/35 bg-amber-300/10 text-white" : "border-white/10 bg-white/5 text-neutral-300")}><Dice6 className={cn("mb-3 h-5 w-5", rolling && "animate-spin")} /><p className="font-heading text-2xl">Rolled</p><p className="text-sm">4d6 drop lowest e assegnazione automatica.</p></button>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[32px] border border-white/10 bg-black/20 p-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {ABILITY_KEYS.map((entry) => (
                        <div key={entry} className="rounded-[28px] border border-white/10 bg-white/5 p-4 text-center">
                          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{abilityLabel(entry)}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <button type="button" disabled={statMethod !== "manual"} onClick={() => tweakScore(entry, -1)} className="h-10 w-10 rounded-full border border-white/10 bg-black/20 text-white disabled:opacity-30">-</button>
                            <p className="font-heading text-4xl text-white">{scores[entry]}</p>
                            <button type="button" disabled={statMethod !== "manual"} onClick={() => tweakScore(entry, 1)} className="h-10 w-10 rounded-full border border-white/10 bg-black/20 text-white disabled:opacity-30">+</button>
                          </div>
                          <p className="mt-3 text-sm text-neutral-400">Final {finalScores[entry]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-neutral-400">Class Skills</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {skillRule.options.map((entry) => {
                        const active = classSkills.includes(entry);
                        const locked = !active && classSkills.length >= skillRule.count;
                        return (
                          <button key={entry} type="button" disabled={locked} onClick={() => setClassSkills((current) => current.includes(entry) ? current.filter((skill) => skill !== entry) : [...current, entry].slice(-skillRule.count))} className={cn("rounded-2xl border px-4 py-3 text-left text-sm", active ? "border-cyan-300/35 bg-cyan-300/10 text-white" : "border-white/10 bg-black/20 text-neutral-300", locked && "opacity-35")}>
                            {entry}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                  <Sword className={cn("mb-4 h-5 w-5", theme.accentClass)} />
                  <div className="grid gap-3">
                    {(loadout?.weaponIds ?? []).map((entry) => itemBySlug.get(entry)).filter(Boolean).map((entry) => (
                      <button key={entry?.id} type="button" onClick={() => setWeaponId(entry?.id ?? "")} className={cn("rounded-2xl border p-4 text-left", weaponId === entry?.id ? "border-amber-300/35 bg-amber-300/10 text-white" : "border-white/10 bg-black/20 text-neutral-300")}>
                        <p>{entry?.name}</p>
                        <p className="text-xs text-neutral-400">{entry?.damage ? `${entry.damage} ${entry.damageType ?? ""}` : "Utility"}</p>
                      </button>
                    ))}
                    {(loadout?.armorIds ?? []).map((entry) => itemBySlug.get(entry)).filter(Boolean).map((entry) => (
                      <button key={entry?.id} type="button" onClick={() => setArmorIds((current) => current.includes(entry?.id ?? "") ? current.filter((value) => value !== entry?.id) : [...current, entry?.id ?? ""])} className={cn("rounded-2xl border p-4 text-left", armorIds.includes(entry?.id ?? "") ? "border-emerald-300/35 bg-emerald-300/10 text-white" : "border-white/10 bg-black/20 text-neutral-300")}>
                        {entry?.name}{entry?.acBonus ? ` · AC +${entry.acBonus}` : ""}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-[32px] border border-white/10 bg-black/20 p-6">
                  <WandSparkles className="mb-4 h-5 w-5 text-fuchsia-200" />
                  <div className="grid gap-3">
                    {(loadout?.gearIds ?? []).map((entry) => itemBySlug.get(entry)).filter(Boolean).map((entry) => (
                      <button key={entry?.id} type="button" onClick={() => setGearIds((current) => current.includes(entry?.id ?? "") ? current.filter((value) => value !== entry?.id) : [...current, entry?.id ?? ""])} className={cn("rounded-2xl border p-4 text-left", gearIds.includes(entry?.id ?? "") ? "border-sky-300/35 bg-sky-300/10 text-white" : "border-white/10 bg-white/5 text-neutral-300")}>
                        {entry?.name}
                      </button>
                    ))}
                    {(loadout?.spellIds ?? []).map((entry) => spellBySlug.get(entry)).filter(Boolean).map((entry) => (
                      <button key={entry?.id} type="button" onClick={() => setSpellIds((current) => current.includes(entry?.id ?? "") ? current.filter((value) => value !== entry?.id) : [...current, entry?.id ?? ""].slice(0, 4))} className={cn("rounded-2xl border p-4 text-left", spellIds.includes(entry?.id ?? "") ? "border-fuchsia-300/35 bg-fuchsia-300/10 text-white" : "border-white/10 bg-white/5 text-neutral-300")}>
                        <p>{entry?.name}</p>
                        <p className="text-xs text-neutral-400">L{entry?.level} {entry?.school}</p>
                      </button>
                    ))}
                  </div>

                  {level >= 4 ? (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-neutral-300">Bonus feat slot</p>
                      <select value={generalFeat} onChange={(event) => setGeneralFeat(event.target.value)} className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-white">
                        <option value="">No feat selected</option>
                        {generalFeats.map((entry) => <option key={entry.id} value={entry.name}>{entry.name}</option>)}
                      </select>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <Button type="button" variant="secondary" size="lg" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}><ChevronLeft className="h-4 w-4" />Back</Button>
              {step < steps.length - 1 ? (
                <Button type="button" size="lg" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>Continue<ChevronRight className="h-4 w-4" /></Button>
              ) : (
                <Button type="submit" size="lg">{submitText}</Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
