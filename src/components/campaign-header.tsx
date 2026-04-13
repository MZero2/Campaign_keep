import Link from "next/link";
import { Search } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { Input } from "@/components/ui/input";

type CampaignHeaderProps = {
  title: string;
  slug: string;
};

export function CampaignHeader({ title, slug }: CampaignHeaderProps) {
  return (
    <header className="border-b border-neutral-800/90 bg-neutral-950/60 px-6 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70">Campaign Space</p>
          <h1 className="font-heading text-2xl text-neutral-100">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <form action={`/campaigns/${slug}/search`} className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              type="search"
              name="q"
              placeholder="Search campaign..."
              className="w-64 pl-9"
            />
          </form>
          <Link
            href="/dashboard"
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            My Dashboard
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
