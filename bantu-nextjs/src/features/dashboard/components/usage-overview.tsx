"use client";

import { AudioLines, Mic, Clock } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { UsageStatCard } from "@/features/dashboard/components/usage-stat-card";

export function UsageOverview() {
  const trpc = useTRPC();
  const { data: generations } = useQuery(
    trpc.generations.getAll.queryOptions(),
  );

  const stats = useMemo(() => {
    if (!generations) {
      return { speechesToday: 0, voicesUsed: 0, minutesGenerated: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayGenerations = generations.filter(
      (g) => new Date(g.createdAt) >= today,
    );

    const voiceNames = new Set(generations.map((g) => g.voiceName));

    const totalChars = generations.reduce((sum, g) => sum + g.text.length, 0);
    const estimatedMinutes = Math.round((totalChars / 150 / 60) * 10) / 10;

    return {
      speechesToday: todayGenerations.length,
      voicesUsed: voiceNames.size,
      minutesGenerated: estimatedMinutes || 0,
    };
  }, [generations]);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Usage Overview</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        <UsageStatCard
          icon={AudioLines}
          label="Speeches Today"
          value={stats.speechesToday}
        />
        <UsageStatCard
          icon={Mic}
          label="Voices Used"
          value={stats.voicesUsed}
        />
        <UsageStatCard
          icon={Clock}
          label="Minutes Generated"
          value={stats.minutesGenerated}
        />
      </div>
    </div>
  );
}
