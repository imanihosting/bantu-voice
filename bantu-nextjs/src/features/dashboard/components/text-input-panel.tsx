"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Mic, Globe, Clock, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import {
  COST_PER_UNIT,
  TEXT_MAX_LENGTH,
} from "@/features/text-to-speech/data/constants";

function estimateDuration(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const seconds = Math.ceil((words / 150) * 60);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function TextInputPanel() {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleGenerate = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    router.push(`/text-to-speech?text=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold">Generate Speech</h2>
        <Badge variant="outline" className="gap-1.5 border-dashed">
          <Coins className="size-3 text-chart-5" />
          <span className="text-xs">
            {text.length === 0 ? (
              "Start typing to estimate"
            ) : (
              <>
                <span className="tabular-nums">
                  ${(text.length * COST_PER_UNIT).toFixed(4)}
                </span>{" "}
                estimated
              </>
            )}
          </span>
        </Badge>
      </div>

      <Separator />

      <div className="p-4 space-y-3">
        <Textarea
          placeholder="Start typing or paste your text here..."
          className="min-h-20 resize-none border-0 bg-muted/30 p-3 shadow-none focus-visible:ring-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={TEXT_MAX_LENGTH}
        />

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5">
            <Mic className="size-3" />
            <span>BantuVoice</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5">
            <Globe className="size-3" />
            <span>English (US)</span>
          </div>
          {text.trim().length > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5">
              <Clock className="size-3" />
              <span>~{estimateDuration(text)}</span>
            </div>
          )}
          <span className="ml-auto tabular-nums">
            {text.length.toLocaleString()} / {TEXT_MAX_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-end px-4 py-3">
        <Button
          size="sm"
          disabled={!text.trim()}
          onClick={handleGenerate}
          className="w-full lg:w-auto"
        >
          Generate speech
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
