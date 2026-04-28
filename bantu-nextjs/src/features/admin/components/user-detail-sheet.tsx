"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AudioLines, KeyRound, Mic, Shield, ShieldOff } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function UserDetailContent({ userId }: { userId: string | null }) {
  const trpc = useTRPC();
  const { data: user, isLoading } = useQuery({
    ...trpc.admin.getUserDetail.queryOptions({ userId: userId! }),
    enabled: !!userId,
  });

  if (!userId || isLoading || !user) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="text-lg">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? (
                <Shield className="mr-1 size-3" />
              ) : (
                <ShieldOff className="mr-1 size-3" />
              )}
              {user.role}
            </Badge>
            {user.banned && (
              <Badge variant="destructive">Banned</Badge>
            )}
            {user.emailVerified && (
              <Badge variant="outline">Verified</Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <AudioLines className="size-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {user.generationCount}
          </p>
          <p className="text-xs text-muted-foreground">Generations</p>
        </div>
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <Mic className="size-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {user.transcriptionCount}
          </p>
          <p className="text-xs text-muted-foreground">Transcriptions</p>
        </div>
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <KeyRound className="size-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {user.apiKeyCount}
          </p>
          <p className="text-xs text-muted-foreground">API Keys</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Details</h4>
        <div className="grid gap-2 text-sm">
          {user.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{user.phone}</span>
            </div>
          )}
          {user.city && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span>
                {[user.city, user.state, user.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">2FA</span>
            <span>{user.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined</span>
            <span>
              {formatDistanceToNow(new Date(user.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last active</span>
            <span>
              {formatDistanceToNow(new Date(user.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {user.banned && user.banReason && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ban reason</span>
              <span className="max-w-[200px] text-right text-destructive">
                {user.banReason}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UserDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailSheet({
  open,
  onOpenChange,
  userId,
}: UserDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <UserDetailContent userId={userId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
