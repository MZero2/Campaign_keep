import { createInviteAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type SettingsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;
  const { access } = await requireCampaignContext(slug);
  const isMaster = access.isMaster;

  const [members, invites] = await Promise.all([
    prisma.campaignMember.findMany({
      where: { campaignId: access.campaign.id },
      include: {
        user: {
          select: { displayName: true, email: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.campaignInvite.findMany({
      where: {
        campaignId: access.campaign.id,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Settings</CardTitle>
          <CardDescription>Configurazione base campagna e membership.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-neutral-300">
          <p>
            <span className="text-neutral-500">Title:</span> {access.campaign.title}
          </p>
          <p>
            <span className="text-neutral-500">System:</span> D&D 5E
          </p>
          <p>
            <span className="text-neutral-500">Status:</span> {access.campaign.status}
          </p>
          <p>
            <span className="text-neutral-500">Visibility:</span> {access.campaign.visibility}
          </p>
          <p>
            <span className="text-neutral-500">Created:</span> {formatDate(access.campaign.createdAt)}
          </p>
          {isMaster ? (
            <form action={createInviteAction.bind(null, access.campaign.id, slug)}>
              <Button type="submit">Generate Invite Token</Button>
            </form>
          ) : (
            <p className="text-neutral-500">Solo il master può generare nuovi inviti.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
              <p className="text-sm text-neutral-100">{member.user.displayName}</p>
              <p className="text-xs text-neutral-500">
                {member.user.email} · {member.role}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Invites</CardTitle>
          <CardDescription>Join tokens attivi e storico accettazioni.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {invites.length === 0 ? (
            <p className="text-sm text-neutral-400">No invites yet.</p>
          ) : (
            invites.map((invite) => (
              <div key={invite.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                <p className="text-sm text-neutral-100">Token: {invite.token}</p>
                <p className="text-xs text-neutral-500">
                  Role: {invite.role} · Expires: {formatDate(invite.expiresAt)} ·{" "}
                  {invite.acceptedAt ? `Accepted ${formatDate(invite.acceptedAt)}` : "Pending"}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
