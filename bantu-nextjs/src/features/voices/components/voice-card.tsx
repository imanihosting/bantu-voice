import Link from "next/link";
import {
  Mic,
  MoreHorizontal,
  Pause,
  Play,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";

export type VoiceItem =
  inferRouterOutputs<AppRouter>["voices"]["getAll"]["custom"][number];

interface VoiceCardProps {
  voice: VoiceItem;
  isFavorite?: boolean;
  onToggleFavorite?: (voiceId: string) => void;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function parseLanguage(locale: string) {
  const [, country] = locale.split("-");
  if (!country) return { flag: "", region: locale };

  const flag = [...country.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");

  const region = regionNames.of(country) ?? country;

  return { flag, region };
}

export function VoiceCard({
  voice,
  isFavorite = false,
  onToggleFavorite,
}: VoiceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { flag, region } = parseLanguage(voice.language);

  const audioSrc = `/api/voices/${encodeURIComponent(voice.id)}`;
  const { isPlaying, isLoading, togglePlay } = useAudioPlayback(audioSrc);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(
    trpc.voices.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Voice deleted successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.voices.getAll.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete voice");
      },
    }),
  );

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/30">
      <div className="flex items-start gap-2.5">
        <VoiceAvatar
          seed={voice.id}
          name={voice.name}
          className="size-10 shrink-0 border border-border shadow-xs"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{voice.name}</span>
          </div>
          <p className="text-xs text-[#327c88]">
            {VOICE_CATEGORY_LABELS[voice.category]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite?.(voice.id)}
          className="shrink-0 p-0.5 text-muted-foreground hover:text-amber-500 transition-colors"
        >
          <Star
            className={cn(
              "size-3.5",
              isFavorite && "fill-amber-500 text-amber-500",
            )}
          />
        </button>
      </div>

      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="shrink-0">{flag}</span>
        <span className="truncate">{region}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="xs"
          className="gap-1.5 rounded-md"
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner className="size-3" />
          ) : isPlaying ? (
            <Pause className="size-3" />
          ) : (
            <Play className="size-3" />
          )}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </Button>

        <Button variant="outline" size="xs" className="gap-1.5 rounded-md" asChild>
          <Link href={`/text-to-speech?voiceId=${voice.id}`}>
            <Mic className="size-3" />
            <span>Use</span>
          </Link>
        </Button>

        {voice.variant === "CUSTOM" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="ml-auto rounded-md px-1.5"
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 text-destructive" />
                <span className="font-medium">Delete voice</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {voice.variant === "CUSTOM" && (
        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete voice</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{voice.name}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  deleteMutation.mutate(
                    { id: voice.id },
                    { onSuccess: () => setShowDeleteDialog(false) },
                  );
                }}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
