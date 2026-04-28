import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <Navbar />
      <section className="border-t border-white/10 bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <header className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-white/40">
              Last updated: {lastUpdated}
            </p>
          </header>
          <div className="space-y-8 text-sm leading-relaxed text-white/60 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-white/80 [&_a]:text-amber-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-amber-300 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3 [&_ul]:mb-4 [&_ul]:space-y-1.5">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
