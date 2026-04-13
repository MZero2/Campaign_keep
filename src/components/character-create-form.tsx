"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DND_2024_SAVES,
  DND_2024_SKILLS,
  getClassTheme,
} from "@/lib/dnd2024";

type ClassCatalog = {
  name: string;
  hitDie: number;
  subclasses: string[];
};

type FeatCatalog = {
  name: string;
  category: string;
};

type CharacterCreateFormProps = {
  action: (formData: FormData) => void;
  classes: ClassCatalog[];
  feats: FeatCatalog[];
};

const abilityFields: Array<{
  key: "str" | "dex" | "con" | "int" | "wis" | "cha";
  label: string;
}> = [
  { key: "str", label: "STR" },
  { key: "dex", label: "DEX" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "WIS" },
  { key: "cha", label: "CHA" },
];

export function CharacterCreateForm({ action, classes, feats }: CharacterCreateFormProps) {
  const defaultClass = classes[0]?.name ?? "Fighter";
  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const theme = getClassTheme(selectedClass);

  const selectedClassEntry = useMemo(
    () => classes.find((entry) => entry.name === selectedClass),
    [classes, selectedClass]
  );

  const featsByCategory = useMemo(() => {
    const bucket = new Map<string, FeatCatalog[]>();
    for (const feat of feats) {
      const list = bucket.get(feat.category) ?? [];
      list.push(feat);
      bucket.set(feat.category, list);
    }
    for (const [key, list] of bucket.entries()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
      bucket.set(key, list);
    }
    return bucket;
  }, [feats]);

  return (
    <form action={action} className={`space-y-3 rounded-lg border p-3 ${theme.cardClass}`}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="className">Class (D&D 2024)</Label>
        <select
          id="className"
          name="className"
          className="h-10 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100"
          value={selectedClass}
          onChange={(event) => setSelectedClass(event.target.value)}
        >
          {classes.map((entry) => (
            <option key={entry.name} value={entry.name}>
              {entry.name} (d{entry.hitDie})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="subclassName">Subclass</Label>
          <select
            id="subclassName"
            name="subclassName"
            className="h-10 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100"
            defaultValue=""
          >
            <option value="">None</option>
            {(selectedClassEntry?.subclasses ?? []).map((subclass) => (
              <option key={subclass} value={subclass}>
                {subclass}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="raceName">Species</Label>
          <Input id="raceName" name="raceName" placeholder="Human" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="background">Background</Label>
          <Input id="background" name="background" placeholder="Soldier" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alignment">Alignment (optional)</Label>
          <Input id="alignment" name="alignment" placeholder="Neutral Good" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Input id="level" name="level" type="number" min={1} max={20} defaultValue={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="speed">Speed</Label>
          <Input id="speed" name="speed" type="number" min={5} max={120} defaultValue={30} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="armorBonus">Armor Bonus</Label>
        <Input id="armorBonus" name="armorBonus" type="number" min={0} max={10} defaultValue={0} />
      </div>

      <div className="space-y-2">
        <Label>Ability Scores (3-20)</Label>
        <div className="grid grid-cols-3 gap-2">
          {abilityFields.map((ability) => (
            <div key={ability.key} className="space-y-1">
              <Label htmlFor={ability.key}>{ability.label}</Label>
              <Input id={ability.key} name={ability.key} type="number" min={3} max={20} defaultValue={10} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Saving Throw Proficiencies</Label>
        <div className="grid grid-cols-3 gap-2 text-xs text-neutral-200">
          {DND_2024_SAVES.map((save) => (
            <label key={save} className="inline-flex items-center gap-2 rounded border border-neutral-700 px-2 py-1">
              <input type="checkbox" name="savingThrowProficiencies" value={save} />
              <span>{save}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Skill Proficiencies</Label>
        <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto rounded border border-neutral-700 p-2 text-xs text-neutral-200">
          {DND_2024_SKILLS.map((skill) => (
            <label key={skill} className="inline-flex items-center gap-2">
              <input type="checkbox" name="skillProficiencies" value={skill} />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Feats (PHB 2024)</Label>
        <div className="max-h-44 space-y-2 overflow-y-auto rounded border border-neutral-700 p-2">
          {["Origin", "General", "Fighting Style", "Epic Boon"].map((category) => (
            <div key={category}>
              <p className={`mb-1 text-xs font-semibold uppercase tracking-wide ${theme.accentClass}`}>
                {category}
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-neutral-200">
                {(featsByCategory.get(category) ?? []).map((feat) => (
                  <label key={feat.name} className="inline-flex items-center gap-2">
                    <input type="checkbox" name="feats" value={feat.name} />
                    <span>{feat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          name="visibility"
          className="h-10 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100"
          defaultValue="PUBLIC_CAMPAIGN"
        >
          <option value="PUBLIC_CAMPAIGN">Public to Party</option>
          <option value="OWNED_PRIVATE">Private to Owner</option>
        </select>
      </div>

      <Button type="submit">Create Character</Button>
    </form>
  );
}
