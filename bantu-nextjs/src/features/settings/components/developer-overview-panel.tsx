"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, CheckCircle2, Clock, KeyRound } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeveloperOverviewPanel() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.developer.getOverviewStats.queryOptions()
  );

  const stats = [
    {
      title: "Total Requests",
      value: data.totalRequests.toLocaleString(),
      description: "Last 7 days",
      icon: Activity,
    },
    {
      title: "Success Rate",
      value: `${data.successRate}%`,
      description: "Last 7 days",
      icon: CheckCircle2,
    },
    {
      title: "Avg Response Time",
      value: `${data.avgDurationMs}ms`,
      description: "Last 7 days",
      icon: Clock,
    },
    {
      title: "Active API Keys",
      value: data.activeKeys.toString(),
      description: "Not revoked",
      icon: KeyRound,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <Card key={stat.title} className="py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
