"use client";

import { useQuery } from "@tanstack/react-query";
import { AudioLines, Mic, Users, Activity } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UsageBreakdownCards() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.admin.getOverview.queryOptions()
  );

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
    },
    {
      title: "TTS Generations",
      value: data.totalGenerations.toLocaleString(),
      icon: AudioLines,
    },
    {
      title: "STT Transcriptions",
      value: data.totalTranscriptions.toLocaleString(),
      icon: Mic,
    },
    {
      title: "API Requests",
      value: data.totalApiRequests.toLocaleString(),
      icon: Activity,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
