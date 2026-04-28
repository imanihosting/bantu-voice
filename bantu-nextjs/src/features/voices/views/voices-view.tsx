"use client";

import { useTRPC } from "@/trpc/client";
import { useQueryState } from "nuqs";
import { useSuspenseQuery } from "@tanstack/react-query";

import { VoicesList } from "../components/voices-list";
import { VoiceFilters } from "../components/voice-filters";
import { FavoritesSection } from "../components/favorites-section";
import { voicesSearchParams } from "../lib/params";
import { VoicesToolbar } from "../components/voices-toolbar";
import { useVoiceFavorites } from "../hooks/use-voice-favorites";
import type { VoiceItem } from "../components/voice-card";

function filterVoices(
  voices: VoiceItem[],
  category: string,
  language: string,
): VoiceItem[] {
  return voices.filter((v) => {
    if (category && v.category !== category) return false;
    if (language && v.language !== language) return false;
    return true;
  });
}

function VoicesContent() {
  const trpc = useTRPC();
  const [query] = useQueryState("query", voicesSearchParams.query);
  const [category] = useQueryState("category", voicesSearchParams.category);
  const [language] = useQueryState("language", voicesSearchParams.language);
  const { data } = useSuspenseQuery(
    trpc.voices.getAll.queryOptions({ query }),
  );

  const { favorites, toggleFavorite } = useVoiceFavorites();

  const filteredCustom = filterVoices(data.custom, category, language);
  const filteredSystem = filterVoices(data.system, category, language);
  const allVoices = [...data.custom, ...data.system];

  return (
    <>
      <VoiceFilters />
      <VoicesList
        title="Team Voices"
        voices={filteredCustom}
        isTeamSection
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
      <FavoritesSection
        voices={allVoices}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
      <VoicesList
        title="Built-in Voices"
        voices={filteredSystem}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    </>
  );
}

export function VoicesView() {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-6">
      <VoicesToolbar />
      <VoicesContent />
    </div>
  );
}
