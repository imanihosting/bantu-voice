import type { Metadata } from "next";

import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { DevDocsSidebar } from "@/features/developers/components/dev-docs-sidebar";

export const metadata: Metadata = { title: "API Documentation" };

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100svh-4rem)] border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl lg:flex lg:gap-10 p-4 lg:p-8">
          {/* Sidebar — sticky on large screens, hidden on mobile */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-20">
              <DevDocsSidebar />
            </div>
          </aside>

          {/* Mobile nav */}
          <div className="mb-6 lg:hidden">
            <DevDocsSidebar />
          </div>

          {/* Main content */}
          <main className="min-w-0 flex-1 space-y-8 pb-16">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
