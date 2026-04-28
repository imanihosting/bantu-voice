"use client";

import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AboutSection } from "@/features/settings/components/about-section";
import { AnalyticsPanel } from "@/features/settings/components/analytics-panel";
import { ApiKeysPanel } from "@/features/settings/components/api-keys-panel";
import { DeveloperOverviewPanel } from "@/features/settings/components/developer-overview-panel";
import { LanguagesGrid } from "@/features/settings/components/languages-grid";
import { QuickStartBlock } from "@/features/settings/components/quick-start-block";
import { RequestLogPanel } from "@/features/settings/components/request-log-panel";
import { ServicesTable } from "@/features/settings/components/services-table";
import { SettingsHeader } from "@/features/settings/components/settings-header";
import { SecurityPanel } from "@/features/settings/components/security-panel";
import { WebhooksPanel } from "@/features/settings/components/webhooks-panel";

export function SettingsView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(
    trpc.settings.getHealth.queryOptions()
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.settings.getHealth.queryKey(),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Settings" className="lg:hidden" />
      <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-8">
        <SettingsHeader services={data.services} onRefresh={handleRefresh} />

        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 pt-4">
            <ServicesTable services={data.services} />
            <Separator />
            <AboutSection />
          </TabsContent>

          <TabsContent value="security" className="pt-4">
            <SecurityPanel />
          </TabsContent>

          <TabsContent value="developer" className="pt-4">
            <Tabs defaultValue="overview">
              <TabsList variant="line">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="logs">Request Log</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 pt-4">
                <DeveloperOverviewPanel />
              </TabsContent>

              <TabsContent value="api-keys" className="space-y-6 pt-4">
                <ApiKeysPanel />
                <Separator />
                <QuickStartBlock />
              </TabsContent>

              <TabsContent value="webhooks" className="pt-4">
                <WebhooksPanel />
              </TabsContent>

              <TabsContent value="analytics" className="pt-4">
                <AnalyticsPanel />
              </TabsContent>

              <TabsContent value="logs" className="pt-4">
                <RequestLogPanel />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="languages" className="pt-4">
            <LanguagesGrid />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
