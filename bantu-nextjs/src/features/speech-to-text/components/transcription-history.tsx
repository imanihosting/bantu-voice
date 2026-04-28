"use client";

import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Clock, FileText, Trash2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranscriptionResult } from "./transcription-result";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function TranscriptionHistory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: transcriptions } = useSuspenseQuery(
    trpc.transcriptions.getAll.queryOptions(),
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deleteMutation = useMutation(
    trpc.transcriptions.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.transcriptions.getAll.queryKey(),
        });
      },
    }),
  );

  if (transcriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
        <FileText className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">No transcriptions yet</p>
        <p className="text-xs text-muted-foreground">
          Upload or record audio above to get started
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] space-y-2 overflow-y-auto overscroll-contain pr-1">
          {transcriptions.map((t) => (
            <div key={t.id} className="space-y-2">
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  setExpandedId(expandedId === t.id ? null : t.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedId(expandedId === t.id ? null : t.id);
                  }
                }}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm">{t.text}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {t.language.toUpperCase()}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="size-2.5" />
                      {formatDuration(t.durationSeconds)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <ChevronDown
                    className={`size-3.5 text-muted-foreground transition-transform ${
                      expandedId === t.id ? "rotate-180" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate({ id: t.id });
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {expandedId === t.id && (
                <div className="ml-1">
                  <TranscriptionResult
                    text={t.text}
                    language={t.language}
                    durationSeconds={t.durationSeconds}
                    segments={
                      t.segments as {
                        start: number;
                        end: number;
                        text: string;
                      }[]
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
