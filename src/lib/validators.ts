import { z } from "zod";

import { DND_2024_CLASS_LABELS } from "@/lib/dnd2024";

export const registerSchema = z.object({
  displayName: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export const campaignCreateSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().min(10).max(600),
});

export const campaignJoinSchema = z.object({
  token: z.string().min(6).max(100),
});

export const wikiCreateSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(20).max(50000),
  visibility: z.enum(["PUBLIC_CAMPAIGN", "PRIVATE_MASTER"]),
  tags: z.string().optional(),
});

export const wikiUpdateSchema = wikiCreateSchema;

export const sessionCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  playedAt: z.string().optional(),
  publicRecap: z.string().trim().max(5000).optional(),
  privateNotes: z.string().trim().max(5000).optional(),
});

export const characterCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  className: z
    .string()
    .trim()
    .refine((value) => (DND_2024_CLASS_LABELS as readonly string[]).includes(value), "Classe non valida"),
  subclassName: z.string().trim().max(80).optional(),
  raceName: z.string().trim().min(2).max(80),
  background: z.string().trim().max(120).optional(),
  alignment: z.string().trim().max(40).optional(),
  level: z.coerce.number().int().min(1).max(20),
  str: z.coerce.number().int().min(3).max(20),
  dex: z.coerce.number().int().min(3).max(20),
  con: z.coerce.number().int().min(3).max(20),
  int: z.coerce.number().int().min(3).max(20),
  wis: z.coerce.number().int().min(3).max(20),
  cha: z.coerce.number().int().min(3).max(20),
  speed: z.coerce.number().int().min(5).max(120).default(30),
  armorBonus: z.coerce.number().int().min(0).max(10).default(0),
  visibility: z.enum(["PUBLIC_CAMPAIGN", "OWNED_PRIVATE"]),
});

export const playerNoteCreateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  content: z.string().trim().min(4).max(10000),
  characterId: z.string().trim().optional(),
});
