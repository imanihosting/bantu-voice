"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Eye,
  Shield,
  ShieldOff,
  Ban,
  ShieldCheck,
  KeyRound,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BanUserDialog } from "./ban-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

interface UserActionsDropdownProps {
  userId: string;
  userName: string;
  role: string;
  banned: boolean;
  onViewDetail: () => void;
}

export function UserActionsDropdown({
  userId,
  userName,
  role,
  banned,
  onViewDetail,
}: UserActionsDropdownProps) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const setRoleMutation = useMutation(
    trpc.admin.setUserRole.mutationOptions({
      onSuccess: () => {
        toast.success(`${userName} role updated`);
        queryClient.invalidateQueries({ queryKey: trpc.admin.getUsers.queryKey() });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const unbanMutation = useMutation(
    trpc.admin.unbanUser.mutationOptions({
      onSuccess: () => {
        toast.success(`${userName} has been unbanned`);
        queryClient.invalidateQueries({ queryKey: trpc.admin.getUsers.queryKey() });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onViewDetail}>
            <Eye className="mr-2 size-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetPasswordDialogOpen(true)}>
            <KeyRound className="mr-2 size-4" />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {role === "user" ? (
            <DropdownMenuItem
              onClick={() =>
                setRoleMutation.mutate({ userId, role: "admin" })
              }
            >
              <Shield className="mr-2 size-4" />
              Make Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                setRoleMutation.mutate({ userId, role: "user" })
              }
            >
              <ShieldOff className="mr-2 size-4" />
              Remove Admin
            </DropdownMenuItem>
          )}
          {banned ? (
            <DropdownMenuItem
              onClick={() => unbanMutation.mutate({ userId })}
            >
              <ShieldCheck className="mr-2 size-4" />
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setBanDialogOpen(true)}>
              <Ban className="mr-2 size-4" />
              Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BanUserDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        userId={userId}
        userName={userName}
      />
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userId={userId}
        userName={userName}
      />
      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        userId={userId}
        userName={userName}
      />
    </>
  );
}
