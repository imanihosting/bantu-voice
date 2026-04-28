"use client";

import { useRef, useState, useEffect } from "react";
import { Pause, Play, Download, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { PLAYBACK_RATES } from "../hooks/use-wavesurfer";

type VoicePreviewMobileVoice = {
  id?: string;
  name: string;
};

export function VoicePreviewMobile({
  audioUrl,
  voice,
  text,
}: {
  audioUrl: string;
  voice: VoicePreviewMobileVoice | null;
  text: string;
}) {
  const isMobile = useIsMobile();
  const selectedVoiceName = voice?.name ?? null;
  const selectedVoiceSeed = voice?.id ?? null;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    audio.pause();
    audio.currentTime = 0;

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!isMobile) {
      audioRef.current?.pause();
    }
  }, [isMobile]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleDownload = (format: "wav" | "mp3") => {
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
  };

  if (!audioUrl) return null;

  return (
    <div className="border-t lg:hidden p-4">
      <audio ref={audioRef} src={audioUrl} />
      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{text}</p>
          {selectedVoiceName && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <VoiceAvatar
                seed={selectedVoiceSeed ?? selectedVoiceName}
                name={selectedVoiceName}
                className="shrink-0"
              />
              <span className="truncate">{selectedVoiceName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="tabular-nums text-xs font-semibold px-2"
            onClick={() => {
              const idx = PLAYBACK_RATES.indexOf(playbackRate as typeof PLAYBACK_RATES[number]);
              const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
              setPlaybackRate(next);
              if (audioRef.current) audioRef.current.playbackRate = next;
            }}
          >
            {playbackRate}x
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Download className="size-4" />
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
          <Button
            variant="default"
            size="icon"
            className="rounded-full"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="fill-background" />
            ) : (
              <Play className="fill-background" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

