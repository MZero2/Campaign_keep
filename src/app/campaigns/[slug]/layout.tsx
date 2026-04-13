import { CampaignHeader } from "@/components/campaign-header";
import { CampaignSidebar } from "@/components/campaign-sidebar";
import { requireCampaignContext } from "@/lib/campaign";

type CampaignLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function CampaignLayout({ children, params }: CampaignLayoutProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <CampaignSidebar slug={slug} role={access.membership.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <CampaignHeader title={access.campaign.title} slug={slug} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
