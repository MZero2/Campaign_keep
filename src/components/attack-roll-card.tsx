"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type AttackRollCardProps = {
  attackBonus: number | null;
  damageDice: string | null;
  damageType: string | null;
  name: string;
};

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

function parseDiceFormula(formula: string | null) {
  if (!formula) return null;
  const match = formula.replace(/\s+/g, "").match(/(\d+)d(\d+)([+-]\d+)?/i);
  if (!match) return null;
  return {
    count: Number(match[1]),
    sides: Number(match[2]),
    modifier: match[3] ? Number(match[3]) : 0,
  };
}

export function AttackRollCard({ attackBonus, damageDice, damageType, name }: AttackRollCardProps) {
  const [toHit, setToHit] = useState<string | null>(null);
  const [damage, setDamage] = useState<string | null>(null);
  const parsedDamage = parseDiceFormula(damageDice);

  function handleToHit() {
    const die = rollDie(20);
    const total = die + (attackBonus ?? 0);
    setToHit(`${die}${attackBonus ? ` ${attackBonus >= 0 ? "+" : "-"} ${Math.abs(attackBonus)}` : ""} = ${total}`);
  }

  function handleDamage() {
    if (!parsedDamage) return;
    const rolls = Array.from({ length: parsedDamage.count }, () => rollDie(parsedDamage.sides));
    const total = rolls.reduce((sum, value) => sum + value, 0) + parsedDamage.modifier;
    setDamage(`${rolls.join(" + ")}${parsedDamage.modifier ? ` ${parsedDamage.modifier >= 0 ? "+" : "-"} ${Math.abs(parsedDamage.modifier)}` : ""} = ${total}`);
  }

  return (
    <div className="rounded-2xl border border-amber-300/15 bg-amber-300/8 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-white">{name}</p>
          <p className="text-sm text-neutral-300">
            Hit {attackBonus !== null && attackBonus !== undefined ? `${attackBonus >= 0 ? "+" : ""}${attackBonus}` : "?"}
            {" · "}
            Damage {damageDice ?? "?"} {damageType ?? ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={handleToHit}>
            Roll Hit
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={handleDamage} disabled={!parsedDamage}>
            Roll Damage
          </Button>
        </div>
      </div>

      {toHit ? <p className="mt-3 text-sm text-amber-100">To hit: {toHit}</p> : null}
      {damage ? <p className="mt-1 text-sm text-neutral-200">Damage: {damage}</p> : null}
    </div>
  );
}
