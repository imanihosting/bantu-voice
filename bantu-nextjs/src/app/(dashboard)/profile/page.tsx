import type { Metadata } from "next";

import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { ProfileView } from "@/features/profile/views/profile-view";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  prefetch(trpc.profile.getProfile.queryOptions());

  return (
    <HydrateClient>
      <ProfileView />
    </HydrateClient>
  );
}
