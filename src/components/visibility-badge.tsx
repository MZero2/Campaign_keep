import type { Visibility } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

type VisibilityBadgeProps = {
  visibility: Visibility;
};

const labelMap: Record<Visibility, string> = {
  PRIVATE_MASTER: "Private Master",
  PUBLIC_CAMPAIGN: "Public Campaign",
  OWNED_PRIVATE: "Owned Private",
};

export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const isPrivate = visibility !== "PUBLIC_CAMPAIGN";

  return (
    <Badge
      className={
        isPrivate
          ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      }
    >
      {labelMap[visibility]}
    </Badge>
  );
}
