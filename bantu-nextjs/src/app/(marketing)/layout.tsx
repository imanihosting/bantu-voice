import { CookieConsentBanner } from "@/features/marketing/components/cookie-consent-banner";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-svh bg-background text-foreground">
      {children}
      <CookieConsentBanner />
    </div>
  );
}
