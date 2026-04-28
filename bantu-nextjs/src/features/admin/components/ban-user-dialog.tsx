"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function BanUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: BanUserDialogProps) {
  const [reason, setReason] = useState("");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const banMutation = useMutation(
    trpc.admin.banUser.mutationOptions({
      onSuccess: () => {
        toast.success(`${userName} has been banned`);
        queryClient.invalidateQueries({ queryKey: trpc.admin.getUsers.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.admin.getUserDetail.queryKey() });
        onOpenChange(false);
        setReason("");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to ban {userName}? They will be unable to
            access the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="ban-reason">Reason</Label>
          <Textarea
            id="ban-reason"
            placeholder="Provide a reason for banning this user..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={banMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => banMutation.mutate({ userId, reason })}
            disabled={banMutation.isPending || reason.trim().length === 0}
          >
            {banMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
