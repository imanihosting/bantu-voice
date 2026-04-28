"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function PlatformHealthCard() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.settings.getHealth.queryOptions()
  );

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const allHealthy = data.services.every((s) => s.status === "connected");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">System Health</CardTitle>
        <Badge variant={allHealthy ? "default" : "destructive"}>
          {allHealthy ? "All Systems Operational" : "Issues Detected"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {service.status === "connected" ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )}
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {service.latency}ms
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
