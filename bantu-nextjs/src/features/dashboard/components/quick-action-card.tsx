import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { QuickAction } from "@/features/dashboard/data/quick-actions";

type QuickActionCardProps = QuickAction;

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <h3 className="text-sm font-medium leading-none">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {description}
        </p>
      </div>

      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-0.5" />
    </Link>
  );
}
