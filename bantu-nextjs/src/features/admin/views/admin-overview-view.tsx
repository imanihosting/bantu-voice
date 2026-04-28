"use client";

import { PageHeader } from "@/components/page-header";
import { AdminStatsCards } from "../components/admin-stats-cards";
import { RecentActivityFeed } from "../components/recent-activity-feed";
import { PlatformHealthCard } from "../components/platform-health-card";

export function AdminOverviewView() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" className="lg:hidden" />
      <div className="space-y-6 p-4 lg:p-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <AdminStatsCards />
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivityFeed />
          <PlatformHealthCard />
        </div>
      </div>
    </div>
  );
}
