"use client";

import { useState } from "react";
import { Pause, Play, Download, Redo, Undo, ChevronDown } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useWaveSurfer, PLAYBACK_RATES } from "../hooks/use-wavesurfer";

type VoicePreviewPanelVoice = {
  id?: string;
  name: string;
};

function formatTime(seconds: number): string {
  return format(new Date(seconds * 1000), "mm:ss");
};

export function VoicePreviewPanel({
  audioUrl,
  voice,
  text,
}: {
  audioUrl: string;
  voice: VoicePreviewPanelVoice | null;
  text: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const selectedVoiceName = voice?.name ?? null;
  const selectedVoiceSeed = voice?.id ?? null;

  const {
    containerRef,
    isPlaying,
    isReady,
    currentTime,
    duration,
    playbackRate,
    togglePlayPause,
    seekBackward,
    seekForward,
    setPlaybackRate,
  } = useWaveSurfer({
    url: audioUrl,
    autoplay: true,
  });

  const handleDownload = (format: "wav" | "mp3") => {
    setIsDownloading(true);

    const safeName =
      text
        .slice(0, 50)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "speech";

    const url =
      format === "mp3"
        ? `${audioUrl}${audioUrl.includes("?") ? "&" : "?"}format=mp3`
        : audioUrl;

    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <div className="h-full gap-8 flex-col border-t hidden flex-1 lg:flex">
      {/* Header */}
      <div className="p-6 pb-0">
        <h3 className="font-semibold text-foreground">Voice preview</h3>
      </div>

      {/* Content */}
      <div className="relative flex flex-1 items-center justify-center">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Badge
              variant="outline"
              className="gap-2 bg-background/90 px-3 py-1.5 text-sm text-muted-foreground shadow-sm"
            >
              <Spinner className="size-4" />
              <span>Loading audio...</span>
            </Badge>
          </div>
        )}
        <div
          ref={containerRef}
          className={cn(
            "w-full cursor-pointer transition-opacity duration-200",
            !isReady && "opacity-0",
          )}
        />
      </div>
       {/* Time display */}
       <div className="flex items-center justify-center">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {formatTime(currentTime)}&nbsp;
          <span className="text-muted-foreground">
            /&nbsp;{formatTime(duration)}
          </span>
        </p>
       </div>

      {/* Footer */}
      <div className="flex flex-col items-center p-6">
        <div className="grid w-full grid-cols-3">
          {/* Metadata */}
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-sm font-medium text-foreground">
              {text}
            </p>
            {selectedVoiceName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <VoiceAvatar
                  seed={selectedVoiceSeed ?? selectedVoiceName}
                  name={selectedVoiceName}
                  className="shrink-0"
                />
                <span className="truncate">{selectedVoiceName}</span>
              </div>
            )}
          </div>

          {/* Player controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon-lg"
              className="flex-col"
              onClick={() => seekBackward(10)}
              disabled={!isReady}
            >
              <Undo className="size-4 -mb-1" />
              <span className="text-[10px] font-medium">10</span>
            </Button>

            <Button
              variant="default"
              size="icon-lg"
              className="rounded-full"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="fill-background" />
              ) : (
                <Play className="fill-background" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon-lg"
              className="flex-col"
              onClick={() => seekForward(10)}
              disabled={!isReady}
            >
              <Redo className="size-4 -mb-1" />
              <span className="text-[10px] font-medium">10</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="ml-1 tabular-nums text-xs font-semibold"
              onClick={() => {
                const idx = PLAYBACK_RATES.indexOf(playbackRate as typeof PLAYBACK_RATES[number]);
                const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
                setPlaybackRate(next);
              }}
              disabled={!isReady}
            >
              {playbackRate}x
            </Button>
          </div>

          {/* Download */}
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDownloading}
                >
                  <Download className="size-4" />
                  Download
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload("wav")}>
                  WAV (lossless)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("mp3")}>
                  MP3 (smaller file)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </div>
  );
};

