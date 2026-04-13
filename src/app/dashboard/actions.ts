"use server";

import crypto from "node:crypto";
import { CampaignRole, Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { campaignCreateSchema, campaignJoinSchema } from "@/lib/validators";

export async function createCampaignAction(formData: FormData) {
  const user = await requireSessionUser();
  const userWithPlan = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, masterPlanActive: true },
  });

  if (!userWithPlan) {
    redirect("/login");
  }

  if (!userWithPlan.masterPlanActive) {
    redirect("/dashboard?error=master_plan_required");
  }

  const parsed = campaignCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    redirect("/dashboard?error=invalid_campaign_input");
  }

  const baseSlug = slugify(parsed.data.title);
  let finalSlug = baseSlug;
  let index = 1;

  while (await prisma.campaign.findUnique({ where: { slug: finalSlug }, select: { id: true } })) {
    index += 1;
    finalSlug = `${baseSlug}-${index}`;
  }

  const campaign = await prisma.campaign.create({
    data: {
      ownerId: user.id,
      title: parsed.data.title,
      slug: finalSlug,
      description: parsed.data.description,
      visibility: Visibility.PUBLIC_CAMPAIGN,
      members: {
        create: {
          userId: user.id,
          role: CampaignRole.MASTER,
        },
      },
    },
    select: { slug: true },
  });

  redirect(`/campaigns/${campaign.slug}`);
}

export async function joinCampaignAction(formData: FormData) {
  const user = await requireSessionUser();

  const parsed = campaignJoinSchema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) {
    redirect("/dashboard?error=invalid_invite_token");
  }

  const token = parsed.data.token.trim();
  const invite = await prisma.campaignInvite.findUnique({
    where: { token },
    include: {
      campaign: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    redirect("/dashboard?error=invite_not_found");
  }

  if (invite.email && invite.email.toLowerCase() !== user.email.toLowerCase()) {
    redirect("/dashboard?error=invite_email_mismatch");
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaignMember.upsert({
      where: {
        campaignId_userId: {
          campaignId: invite.campaignId,
          userId: user.id,
        },
      },
      update: {
        role: invite.role,
      },
      create: {
        campaignId: invite.campaignId,
        userId: user.id,
        role: invite.role,
      },
    });

    await tx.campaignInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  });

  redirect(`/campaigns/${invite.campaign.slug}`);
}

export async function createInviteAction(campaignId: string, campaignSlug?: string) {
  const user = await requireSessionUser();
  const membership = await prisma.campaignMember.findUnique({
    where: {
      campaignId_userId: {
        campaignId,
        userId: user.id,
      },
    },
  });

  if (!membership || membership.role !== CampaignRole.MASTER) {
    redirect("/dashboard?error=not_authorized");
  }

  const token = crypto.randomBytes(4).toString("hex").toUpperCase();

  await prisma.campaignInvite.create({
    data: {
      campaignId,
      invitedById: user.id,
      token,
      role: CampaignRole.PLAYER,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });

  revalidatePath("/dashboard");
  if (campaignSlug) {
    revalidatePath(`/campaigns/${campaignSlug}/settings`);
  }
}
