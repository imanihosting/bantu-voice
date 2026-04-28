"use client";

import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/features/voices/hooks/use-audio-recorder";
import { cn } from "@/lib/utils";

interface RecordAudioPanelProps {
  onRecorded: (blob: Blob) => void;
  disabled?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RecordAudioPanel({
  onRecorded,
  disabled,
}: RecordAudioPanelProps) {
  const {
    isRecording,
    elapsedTime,
    containerRef,
    error,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={cn(
          "flex min-h-[144px] items-center justify-center rounded-lg border bg-muted/30",
          isRecording && "border-red-500/50 bg-red-500/5",
        )}
      >
        {!isRecording && (
          <p className="text-sm text-muted-foreground">
            Click the button below to start recording
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => stopRecording(onRecorded)}
              disabled={disabled}
            >
              <Square className="size-4" />
              Stop Recording
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startRecording}
              disabled={disabled}
            >
              <Mic className="size-4" />
              Start Recording
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-sm font-mono tabular-nums text-muted-foreground">
              {formatTime(elapsedTime)}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
