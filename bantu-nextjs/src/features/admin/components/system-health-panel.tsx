"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SystemHealthPanel() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, isLoading, dataUpdatedAt } = useQuery(
    trpc.settings.getHealth.queryOptions()
  );

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const allHealthy = data.services.every((s) => s.status === "connected");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Service Health</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Last checked: {new Date(dataUpdatedAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={allHealthy ? "default" : "destructive"}>
            {allHealthy ? "All Operational" : "Issues Detected"}
          </Badge>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: trpc.settings.getHealth.queryKey(),
              })
            }
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                {service.status === "connected" ? (
                  <CheckCircle2 className="size-5 text-green-500" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  {service.details && (
                    <p className="text-xs text-muted-foreground">
                      {service.details}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {service.latency}ms
                </span>
                <Badge
                  variant={
                    service.status === "connected" ? "outline" : "destructive"
                  }
                >
                  {service.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
