import { Mic, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceCard } from "./voice-card";
import { VoiceCreateDialog } from "./voice-create-dialog";
import type { VoiceItem } from "./voice-card";

interface VoicesListProps {
  title: string;
  voices: VoiceItem[];
  isTeamSection?: boolean;
  favorites?: Set<string>;
  onToggleFavorite?: (voiceId: string) => void;
}

export function VoicesList({
  title,
  voices,
  isTeamSection = false,
  favorites,
  onToggleFavorite,
}: VoicesListProps) {
  if (!voices.length) {
    if (isTeamSection) {
      return (
        <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted">
              <Mic className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">
                You haven&apos;t created any custom voices yet.
              </p>
            </div>
          </div>
          <VoiceCreateDialog>
            <Button variant="outline" size="sm">
              <Plus className="size-3.5" />
              Create your first voice
            </Button>
          </VoiceCreateDialog>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <Badge variant="secondary" className="text-xs tabular-nums">
          {voices.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {voices.map((voice) => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            isFavorite={favorites?.has(voice.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
