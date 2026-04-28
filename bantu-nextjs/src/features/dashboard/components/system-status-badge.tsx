import { Badge } from "@/components/ui/badge";

export function SystemStatusBadge() {
  return (
    <Badge variant="outline" className="gap-1.5 border-dashed py-1 px-2.5">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs text-muted-foreground">All systems operational</span>
    </Badge>
  );
}
