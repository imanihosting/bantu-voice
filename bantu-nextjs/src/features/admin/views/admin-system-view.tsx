"use client";

import { PageHeader } from "@/components/page-header";
import { SystemHealthPanel } from "../components/system-health-panel";
import { SystemVoicesPanel } from "../components/system-voices-panel";

export function AdminSystemView() {
  return (
    <div>
      <PageHeader title="System Management" className="lg:hidden" />
      <div className="space-y-6 p-4 lg:p-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            System Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Service health and system voice management
          </p>
        </div>
        <SystemHealthPanel />
        <SystemVoicesPanel />
      </div>
    </div>
  );
}
