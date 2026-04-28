"use client";

import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Key, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ApiKeysEmpty } from "./api-keys-empty";
import { CreateKeyDialog } from "./create-key-dialog";

function ApiKeyActions({
  apiKey,
}: {
  apiKey: { id: string; revokedAt: Date | null };
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const revokeMutation = useMutation(
    trpc.apiKeys.revoke.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.apiKeys.getAll.queryKey(),
        });
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.apiKeys.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.apiKeys.getAll.queryKey(),
        });
      },
    })
  );

  const isRevoked = !!apiKey.revokedAt;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={revokeMutation.isPending || deleteMutation.isPending}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isRevoked && (
          <>
            <DropdownMenuItem
              onClick={() => revokeMutation.mutate({ id: apiKey.id })}
              disabled={revokeMutation.isPending}
            >
              <Ban className="size-4" />
              Revoke
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          variant="destructive"
          onClick={() => deleteMutation.mutate({ id: apiKey.id })}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ApiKeysPanel() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const trpc = useTRPC();
  const { data: apiKeys } = useSuspenseQuery(
    trpc.apiKeys.getAll.queryOptions()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Key className="size-4" />
            API Keys
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage keys for the Developer REST API
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-3.5" />
          Create key
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <ApiKeysEmpty onCreateClick={() => setDialogOpen(true)} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey) => {
              const isRevoked = !!apiKey.revokedAt;
              return (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">
                    {apiKey.name}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono text-muted-foreground">
                      {apiKey.keyPrefix}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(apiKey.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {apiKey.lastUsedAt
                      ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isRevoked ? "destructive" : "outline"}
                    >
                      {isRevoked ? "Revoked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ApiKeyActions apiKey={apiKey} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <CreateKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
