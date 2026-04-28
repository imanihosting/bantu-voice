import type { LucideIcon } from "lucide-react";

interface UsageStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export function UsageStatCard({ icon: Icon, label, value }: UsageStatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}
