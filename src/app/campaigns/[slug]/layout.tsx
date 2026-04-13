import { CampaignShell } from "@/components/campaign-shell";
import { requireCampaignContext } from "@/lib/campaign";

type CampaignLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function CampaignLayout({ children, params }: CampaignLayoutProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);

  return (
    <CampaignShell slug={slug} role={access.membership.role} title={access.campaign.title}>
      {children}
    </CampaignShell>
  );
}
