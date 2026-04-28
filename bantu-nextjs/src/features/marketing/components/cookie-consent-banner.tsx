"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const CONSENT_KEY = "taurai-cookie-consent";

function getSnapshot() {
  return localStorage.getItem(CONSENT_KEY);
}

function getServerSnapshot() {
  return "pending" as string | null;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function CookieConsentBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "declined");
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  // Hide on server ("pending"), or after user has made a choice
  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-xl border border-white/10 bg-black/90 px-6 py-4 backdrop-blur-lg sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-white/60 sm:text-left">
          We use cookies to improve your experience. By continuing, you agree to
          our use of cookies. See our{" "}
          <Link
            href="/cookies"
            className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
          >
            Cookie Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/cookies"
            className="text-xs text-white/40 underline underline-offset-2 hover:text-white/60"
          >
            Manage Preferences
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={decline}
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
