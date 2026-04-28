import type { Metadata } from "next";
import { BatchTTSView } from "@/features/text-to-speech/views/batch-tts-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

export const metadata: Metadata = { title: "Batch Text to Speech" };

export default async function BatchTTSPage() {
  prefetch(trpc.voices.getAll.queryOptions());

  return (
    <HydrateClient>
      <BatchTTSView />
    </HydrateClient>
  );
}
