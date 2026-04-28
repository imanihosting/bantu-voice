"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "taurai-voice-favorites";

function readFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeFavorites(favorites: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // localStorage full or unavailable
  }
}

export function useVoiceFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => readFavorites());

  const toggleFavorite = useCallback((voiceId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(voiceId)) {
        next.delete(voiceId);
      } else {
        next.add(voiceId);
      }
      writeFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (voiceId: string) => favorites.has(voiceId),
    [favorites],
  );

  return { favorites, toggleFavorite, isFavorite };
}
