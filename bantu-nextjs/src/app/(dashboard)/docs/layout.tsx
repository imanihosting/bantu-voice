import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { DocsSidebar } from "@/features/docs/components/docs-sidebar";

export const metadata: Metadata = { title: "API Docs" };

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="API Docs" className="lg:hidden" />
      <div className="mx-auto max-w-5xl lg:flex lg:gap-10 p-4 lg:p-8">
        {/* Sidebar — sticky on large screens, hidden on mobile */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-8">
            <DocsSidebar />
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="mb-6 lg:hidden">
          <DocsSidebar />
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
}
