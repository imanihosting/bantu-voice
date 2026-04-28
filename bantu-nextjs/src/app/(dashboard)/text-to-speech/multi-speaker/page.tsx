import type { Metadata } from "next";
import { MultiSpeakerTTSView } from "@/features/text-to-speech/views/multi-speaker-tts-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

export const metadata: Metadata = { title: "Multi-Speaker Text to Speech" };

export default async function MultiSpeakerTTSPage() {
  prefetch(trpc.voices.getAll.queryOptions());

  return (
    <HydrateClient>
      <MultiSpeakerTTSView />
    </HydrateClient>
  );
}
