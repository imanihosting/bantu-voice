"use client";

import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { SystemStatusBadge } from "@/features/dashboard/components/system-status-badge";

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export function DashboardHeader({ children }: DashboardHeaderProps) {
  const { data: session } = authClient.useSession();

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Create speech using AI voices. Generate narration, ads, characters, podcasts and more.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SystemStatusBadge />
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="mailto:business@codewithantonio.com">
                <ThumbsUp className="size-3.5" />
                <span className="hidden lg:block">Feedback</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="mailto:business@codewithantonio.com">
                <Headphones className="size-3.5" />
                <span className="hidden lg:block">Help</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
