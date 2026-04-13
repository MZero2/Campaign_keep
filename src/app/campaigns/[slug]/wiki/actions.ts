"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { CampaignRole, Visibility } from "@prisma/client";

import { requireSessionUser } from "@/lib/auth";
import { getCampaignAccess } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { wikiCreateSchema, wikiUpdateSchema } from "@/lib/validators";

async function ensureMasterAccess(campaignSlug: string) {
  const sessionUser = await requireSessionUser();
  const access = await getCampaignAccess(campaignSlug, sessionUser.id);

  if (!access) {
    notFound();
  }

  if (access.membership.role !== CampaignRole.MASTER) {
    redirect(`/campaigns/${campaignSlug}/wiki?error=forbidden`);
  }

  return { sessionUser, access };
}

async function ensureUniqueWikiSlug(campaignId: string, desiredTitle: string, existingId?: string) {
  const base = slugify(desiredTitle);
  let index = 1;
  let finalSlug = base || "untitled";

  while (true) {
    const existingPage = await prisma.wikiPage.findUnique({
      where: {
        campaignId_slug: {
          campaignId,
          slug: finalSlug,
        },
      },
      select: { id: true },
    });

    if (!existingPage || existingPage.id === existingId) {
      return finalSlug;
    }

    index += 1;
    finalSlug = `${base}-${index}`;
  }
}

function normalizeTags(tagsField: string | undefined) {
  if (!tagsField) return [];
  return tagsField
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export async function createWikiPageAction(campaignSlug: string, formData: FormData) {
  const { sessionUser, access } = await ensureMasterAccess(campaignSlug);
  const parsed = wikiCreateSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    visibility: formData.get("visibility"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    redirect(`/campaigns/${campaignSlug}/wiki?error=invalid_wiki_input`);
  }

  const pageSlug = await ensureUniqueWikiSlug(access.campaign.id, parsed.data.title);

  await prisma.wikiPage.create({
    data: {
      campaignId: access.campaign.id,
      title: parsed.data.title,
      slug: pageSlug,
      content: parsed.data.content,
      visibility: parsed.data.visibility as Visibility,
      tags: normalizeTags(parsed.data.tags),
      createdBy: sessionUser.id,
      updatedBy: sessionUser.id,
    },
  });

  revalidatePath(`/campaigns/${campaignSlug}/wiki`);
  redirect(`/campaigns/${campaignSlug}/wiki/${pageSlug}`);
}

export async function updateWikiPageAction(campaignSlug: string, pageSlug: string, formData: FormData) {
  const { sessionUser, access } = await ensureMasterAccess(campaignSlug);
  const parsed = wikiUpdateSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    visibility: formData.get("visibility"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    redirect(`/campaigns/${campaignSlug}/wiki/${pageSlug}?error=invalid_wiki_input`);
  }

  const existingPage = await prisma.wikiPage.findUnique({
    where: {
      campaignId_slug: {
        campaignId: access.campaign.id,
        slug: pageSlug,
      },
    },
    select: { id: true },
  });

  if (!existingPage) {
    notFound();
  }

  const newSlug = await ensureUniqueWikiSlug(access.campaign.id, parsed.data.title, existingPage.id);
  await prisma.wikiPage.update({
    where: { id: existingPage.id },
    data: {
      title: parsed.data.title,
      slug: newSlug,
      content: parsed.data.content,
      visibility: parsed.data.visibility as Visibility,
      tags: normalizeTags(parsed.data.tags),
      updatedBy: sessionUser.id,
    },
  });

  revalidatePath(`/campaigns/${campaignSlug}/wiki`);
  revalidatePath(`/campaigns/${campaignSlug}/wiki/${pageSlug}`);
  redirect(`/campaigns/${campaignSlug}/wiki/${newSlug}?saved=1`);
}

export async function deleteWikiPageAction(campaignSlug: string, pageSlug: string) {
  const { access } = await ensureMasterAccess(campaignSlug);
  const existingPage = await prisma.wikiPage.findUnique({
    where: {
      campaignId_slug: {
        campaignId: access.campaign.id,
        slug: pageSlug,
      },
    },
    select: { id: true },
  });

  if (!existingPage) {
    notFound();
  }

  await prisma.wikiPage.delete({ where: { id: existingPage.id } });
  revalidatePath(`/campaigns/${campaignSlug}/wiki`);
  redirect(`/campaigns/${campaignSlug}/wiki`);
}
