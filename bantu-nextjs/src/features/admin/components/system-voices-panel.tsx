"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SystemVoicesPanel() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: voices, isLoading } = useQuery(
    trpc.admin.getSystemVoices.queryOptions()
  );

  const deleteMutation = useMutation(
    trpc.admin.deleteSystemVoice.mutationOptions({
      onSuccess: () => {
        toast.success(`Voice "${deleteName}" deleted`);
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getSystemVoices.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getOverview.queryKey(),
        });
        setDeleteId(null);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  if (isLoading || !voices) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="size-4" />
            System Voices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="size-4" />
            System Voices
            <Badge variant="secondary" className="ml-1">
              {voices.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {voices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No system voices configured
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Generations</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voices.map((voice) => (
                    <TableRow key={voice.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{voice.name}</p>
                          {voice.description && (
                            <p className="text-xs text-muted-foreground">
                              {voice.description.slice(0, 60)}
                              {voice.description.length > 60 ? "..." : ""}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {voice.category.toLowerCase().replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {voice.language}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {voice._count.generations}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeleteId(voice.id);
                            setDeleteName(voice.name);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete System Voice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteName}&quot;? Existing
              generations using this voice will not be affected, but new
              generations cannot use it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate({ voiceId: deleteId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Delete Voice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
