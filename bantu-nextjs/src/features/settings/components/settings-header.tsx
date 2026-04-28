import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ServiceStatus {
  name: string;
  status: "connected" | "disconnected";
  latency: number;
  details?: string;
}

export function SettingsHeader({
  services,
  onRefresh,
}: {
  services: ServiceStatus[];
  onRefresh: () => void;
}) {
  const degradedCount = services.filter(
    (s) => s.status !== "connected"
  ).length;
  const allHealthy = degradedCount === 0;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your TaurAI instance
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block size-2 rounded-full ${
              allHealthy ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {allHealthy
              ? "All systems operational"
              : `${degradedCount} service${degradedCount > 1 ? "s" : ""} degraded`}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
