"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BookOpen,
  Compass,
  Flag,
  Gem,
  LayoutDashboard,
  MapPinned,
  ScrollText,
  Settings,
  ShieldAlert,
  Swords,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

type CampaignSidebarProps = {
  slug: string;
  role: string;
};

const sections = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "sessions", label: "Sessions", icon: ScrollText },
  { href: "wiki", label: "Wiki", icon: BookOpen },
  { href: "npcs", label: "NPCs", icon: Users },
  { href: "locations", label: "Locations", icon: MapPinned },
  { href: "items", label: "Items", icon: Gem },
  { href: "quests", label: "Quests", icon: Flag },
  { href: "handouts", label: "Handouts", icon: ShieldAlert },
  { href: "characters", label: "Characters", icon: Swords },
  { href: "notes", label: "My Notes", icon: Compass },
  { href: "archive", label: "Archive", icon: Archive },
  { href: "settings", label: "Settings", icon: Settings },
];

export function CampaignSidebar({ slug, role }: CampaignSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-neutral-800/90 bg-neutral-950/70 p-4 lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="font-heading text-lg text-amber-100">
          Campaign Keep
        </Link>
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-200">
          {role}
        </span>
      </div>

      <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {sections.map((section) => {
          const href = `/campaigns/${slug}${section.href ? `/${section.href}` : ""}`;
          const active = pathname === href;
          const Icon = section.icon;

          return (
            <Link
              key={section.label}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-amber-500/20 text-amber-100"
                  : "text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
