"use client";

import { useCallback, useState } from "react";

import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ChangePasswordForm } from "./change-password-form";
import { TwoFactorSetup } from "./two-factor-setup";

export function SecurityPanel() {
  const { data: session, isPending } = authClient.useSession();
  // Local override so UI updates immediately after enable/disable
  const [twoFactorOverride, setTwoFactorOverride] = useState<boolean | null>(null);

  const serverEnabled = !!(session?.user as Record<string, unknown> | undefined)?.twoFactorEnabled;
  const twoFactorEnabled = twoFactorOverride ?? serverEnabled;

  const handleTwoFactorChange = useCallback(() => {
    setTwoFactorOverride((prev) => (prev === null ? !serverEnabled : !prev));
  }, [serverEnabled]);

  if (isPending || !session?.user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Protect your account with an authenticator app for an additional layer of security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorSetup
            enabled={twoFactorEnabled}
            onStatusChange={handleTwoFactorChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
