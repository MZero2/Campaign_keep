import type { CampaignRole, Visibility } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getCampaignAccess(slug: string, userId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId },
        take: 1,
      },
    },
  });

  if (!campaign || campaign.members.length === 0) {
    return null;
  }

  return {
    campaign,
    membership: campaign.members[0],
    isMaster: campaign.members[0].role === "MASTER",
  };
}

export function canViewByVisibility(
  visibility: Visibility,
  role: CampaignRole,
  ownerUserId: string | null,
  userId: string
) {
  if (role === "MASTER") {
    return true;
  }

  if (visibility === "PUBLIC_CAMPAIGN") {
    return true;
  }

  if (visibility === "OWNED_PRIVATE" && ownerUserId && ownerUserId === userId) {
    return true;
  }

  return false;
}
