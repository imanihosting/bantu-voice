"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface TwoFactorSetupProps {
  enabled: boolean;
  onStatusChange: () => void;
}

export function TwoFactorSetup({ enabled, onStatusChange }: TwoFactorSetupProps) {
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState<"password" | "qr" | "verify" | "backup">("password");

  const resetState = () => {
    setPassword("");
    setTotpUri(null);
    setVerifyCode("");
    setBackupCodes(null);
    setStep("password");
    setIsPending(false);
  };

  const handleEnable = async () => {
    if (!password) return;
    setIsPending(true);

    try {
      // Step 1: Enable 2FA
      const { error } = await authClient.twoFactor.enable({
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to enable 2FA");
        setIsPending(false);
        return;
      }

      // Step 2: Get TOTP URI for QR code
      const totpRes = await authClient.twoFactor.getTotpUri({
        password,
      });

      if (totpRes.error) {
        toast.error(totpRes.error.message || "Failed to get QR code");
        setIsPending(false);
        return;
      }

      setTotpUri(totpRes.data?.totpURI ?? null);
      setStep("qr");
    } catch {
      toast.error("Failed to enable 2FA");
    } finally {
      setIsPending(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) return;
    setIsPending(true);

    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: verifyCode,
      });

      if (error) {
        toast.error(error.message || "Invalid code");
        setIsPending(false);
        return;
      }

      // Generate backup codes
      const backupRes = await authClient.twoFactor.generateBackupCodes({
        password,
      });

      if (backupRes.data?.backupCodes) {
        setBackupCodes(backupRes.data.backupCodes);
        setStep("backup");
      } else {
        toast.success("Two-factor authentication enabled");
        setShowEnableDialog(false);
        resetState();
        onStatusChange();
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsPending(false);
    }
  };

  const handleBackupDone = () => {
    toast.success("Two-factor authentication enabled");
    setShowEnableDialog(false);
    resetState();
    onStatusChange();
  };

  const handleDisable = async () => {
    if (!password) return;
    setIsPending(true);

    try {
      const { error } = await authClient.twoFactor.disable({
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to disable 2FA");
        setIsPending(false);
        return;
      }

      toast.success("Two-factor authentication disabled");
      setShowDisableDialog(false);
      resetState();
      onStatusChange();
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <ShieldCheck className="size-5 text-green-600" />
          ) : (
            <ShieldOff className="size-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Two-factor authentication</p>
            <p className="text-xs text-muted-foreground">
              Add an extra layer of security using an authenticator app.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"}>
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
          {enabled ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                resetState();
                setShowDisableDialog(true);
              }}
            >
              Disable
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                resetState();
                setShowEnableDialog(true);
              }}
            >
              Enable
            </Button>
          )}
        </div>
      </div>

      {/* Enable 2FA Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={(open) => {
        if (!open) resetState();
        setShowEnableDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          {step === "password" && (
            <>
              <DialogHeader>
                <DialogTitle>Enable two-factor authentication</DialogTitle>
                <DialogDescription>
                  Enter your password to set up 2FA with an authenticator app.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <Label htmlFor="enable-password">Password</Label>
                <Input
                  id="enable-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEnable()}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleEnable}
                  disabled={isPending || !password}
                >
                  {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Continue
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "qr" && totpUri && (
            <>
              <DialogHeader>
                <DialogTitle>Scan QR code</DialogTitle>
                <DialogDescription>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code below.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="rounded-lg border bg-white p-4">
                  {/* Render QR code using an img with a Google Charts QR API */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="w-full space-y-3">
                  <Label>Verification code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={verifyCode}
                      onChange={setVerifyCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleVerify}
                  disabled={isPending || verifyCode.length !== 6}
                >
                  {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Verify &amp; activate
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "backup" && backupCodes && (
            <>
              <DialogHeader>
                <DialogTitle>Save your backup codes</DialogTitle>
                <DialogDescription>
                  Store these codes in a safe place. Each code can only be used once if you lose access to your authenticator app.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm">
                  {backupCodes.map((code) => (
                    <span key={code}>{code}</span>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join("\n"));
                    toast.success("Backup codes copied");
                  }}
                >
                  Copy codes
                </Button>
                <Button onClick={handleBackupDone}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={(open) => {
        if (!open) resetState();
        setShowDisableDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable 2FA. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Label htmlFor="disable-password">Password</Label>
            <Input
              id="disable-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDisable()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={isPending || !password}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
