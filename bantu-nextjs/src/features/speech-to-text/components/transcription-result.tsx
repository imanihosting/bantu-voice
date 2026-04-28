"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Segment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptionResultProps {
  text: string;
  language: string;
  durationSeconds: number;
  segments: Segment[];
  /** If true, use a taller max-height (for the main result vs history items) */
  expanded?: boolean;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 10);
  return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function TranscriptionResult({
  text,
  language,
  durationSeconds,
  segments,
  expanded = false,
}: TranscriptionResultProps) {
  const [copied, setCopied] = useState(false);
  const [showSegments, setShowSegments] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const textMaxHeight = expanded ? "max-h-[400px]" : "max-h-[240px]";

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      {/* Header: language badge, duration, actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {language.toUpperCase()}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {formatDuration(durationSeconds)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleDownload}
          >
            <Download className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Scrollable transcription text */}
      <div
        className={`${textMaxHeight} overflow-y-auto overscroll-contain rounded-md bg-muted/40 p-3`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
      </div>

      {/* Timestamp segments (collapsible) */}
      {segments.length > 1 && (
        <>
          <Separator />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit gap-1.5 text-xs"
            onClick={() => setShowSegments(!showSegments)}
          >
            {showSegments ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
            {showSegments ? "Hide" : "Show"} timestamps ({segments.length}{" "}
            segments)
          </Button>

          {showSegments && (
            <div className="max-h-[200px] overflow-y-auto overscroll-contain rounded-md bg-muted/40 p-3">
              <div className="space-y-1.5">
                {segments.map((seg, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                      {formatTimestamp(seg.start)} — {formatTimestamp(seg.end)}
                    </span>
                    <span>{seg.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
