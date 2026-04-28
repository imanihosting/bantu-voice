import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Languages", href: "/#languages" },
      { label: "Features", href: "/#features" },
      { label: "API Documentation", href: "/developers" },
      { label: "Get Started", href: "/sign-up" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Contact", href: "/contact" },
      { label: "support@taurai.ai", href: "mailto:support@taurai.ai" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
};

export function Footer() {
  return (
    <footer id="about" className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block">
              <Image
                src="/taurai_top_logo.svg"
                alt="TaurAI"
                width={110}
                height={34}
                className="invert"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              AI-powered voice platform built for Africa. Natural text-to-speech
              and speech-to-text across dozens of African languages.
            </p>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((group) => (
            <div key={group.title} className="lg:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 sm:flex-row">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} TaurAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
