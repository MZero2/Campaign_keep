"use client";

import { usePathname } from "next/navigation";

import { CampaignHeader } from "@/components/campaign-header";
import { CampaignSidebar } from "@/components/campaign-sidebar";

type CampaignShellProps = {
  children: React.ReactNode;
  role: string;
  slug: string;
  title: string;
};

export function CampaignShell({ children, role, slug, title }: CampaignShellProps) {
  const pathname = usePathname();
  const immersiveCharacterRoute =
    pathname.endsWith("/characters/new") ||
    pathname.endsWith("/edit") ||
    /\/characters\/[^/]+$/.test(pathname);

  if (immersiveCharacterRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <CampaignSidebar slug={slug} role={role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <CampaignHeader title={title} slug={slug} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
