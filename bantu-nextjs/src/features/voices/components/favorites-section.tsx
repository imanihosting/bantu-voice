import { Star } from "lucide-react";

import { VoiceCard } from "./voice-card";
import type { VoiceItem } from "./voice-card";

interface FavoritesSectionProps {
  voices: VoiceItem[];
  favorites: Set<string>;
  onToggleFavorite: (voiceId: string) => void;
}

export function FavoritesSection({
  voices,
  favorites,
  onToggleFavorite,
}: FavoritesSectionProps) {
  const favoriteVoices = voices.filter((v) => favorites.has(v.id));

  if (favoriteVoices.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Star className="size-3.5 fill-amber-500 text-amber-500" />
        <h3 className="text-sm font-semibold tracking-tight">Favorites</h3>
        <span className="text-xs tabular-nums text-muted-foreground">
          {favoriteVoices.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {favoriteVoices.map((voice) => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            isFavorite
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
