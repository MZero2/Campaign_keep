import { notFound } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { getCampaignAccess } from "@/lib/permissions";

export async function requireCampaignContext(slug: string) {
  const sessionUser = await requireSessionUser();
  const access = await getCampaignAccess(slug, sessionUser.id);

  if (!access) {
    notFound();
  }

  return {
    sessionUser,
    access,
  };
}
