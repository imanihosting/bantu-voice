"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  AudioLines,
  Mic,
  Activity,
  UserCheck,
  Volume2,
} from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminStatsCards() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.admin.getOverview.queryOptions()
  );

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[108px] rounded-xl" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      description: "Registered accounts",
      icon: Users,
    },
    {
      title: "Active Users",
      value: data.activeUsers.toLocaleString(),
      description: "Last 7 days",
      icon: UserCheck,
    },
    {
      title: "Generations",
      value: data.totalGenerations.toLocaleString(),
      description: "Total TTS outputs",
      icon: AudioLines,
    },
    {
      title: "Transcriptions",
      value: data.totalTranscriptions.toLocaleString(),
      description: "Total STT outputs",
      icon: Mic,
    },
    {
      title: "API Requests",
      value: data.totalApiRequests.toLocaleString(),
      description: "All time",
      icon: Activity,
    },
    {
      title: "System Voices",
      value: data.systemVoices.toString(),
      description: "Available voices",
      icon: Volume2,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
