import type { Metadata } from "next";

import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { SettingsView } from "@/features/settings/views/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  prefetch(trpc.settings.getHealth.queryOptions());
  prefetch(trpc.apiKeys.getAll.queryOptions());
  prefetch(trpc.webhooks.getAll.queryOptions());
  prefetch(trpc.developer.getOverviewStats.queryOptions());
  prefetch(trpc.developer.getAnalytics.queryOptions({ days: 30 }));
  prefetch(trpc.developer.getRequestLogs.queryOptions({ limit: 50 }));

  return (
    <HydrateClient>
      <SettingsView />
    </HydrateClient>
  );
}
