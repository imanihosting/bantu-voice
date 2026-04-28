"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Introduction", href: "/docs" },
  { title: "Authentication", href: "/docs/authentication" },
  {
    title: "API Reference",
    children: [
      { title: "Text to Speech", href: "/docs/text-to-speech" },
      { title: "Speech to Text", href: "/docs/speech-to-text" },
      { title: "Voices", href: "/docs/voices" },
      { title: "Generations", href: "/docs/generations" },
    ],
  },
  { title: "Webhooks", href: "/docs/webhooks" },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        if ("children" in item && item.children) {
          return (
            <div key={item.title} className="pt-4 first:pt-0">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item.title}
              </span>
              <div className="mt-1 space-y-0.5">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      pathname === child.href
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href!}
            className={cn(
              "block rounded-md px-3 py-1.5 text-sm transition-colors",
              pathname === item.href
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
