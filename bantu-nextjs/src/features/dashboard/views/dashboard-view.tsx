import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { StatIndicators } from "@/features/dashboard/components/stat-indicators";
import { TextInputPanel } from "@/features/dashboard/components/text-input-panel";
import { QuickActionsPanel } from "@/features/dashboard/components/quick-actions-panel";
import { UsageOverview } from "@/features/dashboard/components/usage-overview";

function StatIndicatorsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-36 rounded-full" />
      <Skeleton className="h-6 w-28 rounded-full" />
    </div>
  );
}

export function DashboardView() {
  return (
    <div>
      <PageHeader title="Dashboard" className="lg:hidden" />
      <div className="space-y-5 p-4 lg:p-8">
        <DashboardHeader>
          <Suspense fallback={<StatIndicatorsSkeleton />}>
            <StatIndicators />
          </Suspense>
        </DashboardHeader>
        <TextInputPanel />
        <QuickActionsPanel />
        <UsageOverview />
      </div>
    </div>
  );
}
