"use client";

import { PageHeader } from "@/components/page-header";
import { PlatformAnalyticsCharts } from "../components/platform-analytics-charts";
import { UsageBreakdownCards } from "../components/usage-breakdown-cards";

export function AdminAnalyticsView() {
  return (
    <div>
      <PageHeader title="Platform Analytics" className="lg:hidden" />
      <div className="space-y-6 p-4 lg:p-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Platform Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Platform-wide usage and performance metrics
          </p>
        </div>
        <UsageBreakdownCards />
        <PlatformAnalyticsCharts />
      </div>
    </div>
  );
}
