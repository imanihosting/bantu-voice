"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AudioLines, Mic, UserPlus } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentActivityFeed() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.admin.getRecentActivity.queryOptions()
  );

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const activities = [
    ...data.recentUsers.map((u) => ({
      type: "signup" as const,
      icon: UserPlus,
      label: `${u.name} signed up`,
      detail: u.email,
      time: u.createdAt,
    })),
    ...data.recentGenerations.map((g) => ({
      type: "generation" as const,
      icon: AudioLines,
      label: `TTS generation created`,
      detail: `${g.voiceName} — ${g.text.slice(0, 60)}${g.text.length > 60 ? "..." : ""}`,
      time: g.createdAt,
    })),
    ...data.recentTranscriptions.map((t) => ({
      type: "transcription" as const,
      icon: Mic,
      label: `Transcription completed`,
      detail: `${t.language} — ${Math.round(t.durationSeconds)}s`,
      time: t.createdAt,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
   .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div key={`${activity.type}-${i}`} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-muted p-1.5">
                  <activity.icon className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-none">
                    {activity.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.detail}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.time), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
