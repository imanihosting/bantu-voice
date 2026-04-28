"use client";

import { useState } from "react";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Globe,
  MoreHorizontal,
  Play,
  Plus,
  Trash2,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AVAILABLE_EVENTS = [
  { value: "generation.completed" as const, label: "Generation completed" },
  { value: "generation.failed" as const, label: "Generation failed" },
];

function WebhookActions({
  webhook,
}: {
  webhook: { id: string; enabled: boolean };
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation(
    trpc.webhooks.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.webhooks.getAll.queryKey(),
        });
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.webhooks.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.webhooks.getAll.queryKey(),
        });
        toast.success("Webhook deleted");
      },
    })
  );

  const testMutation = useMutation(
    trpc.webhooks.test.mutationOptions({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(`Test sent (${data.statusCode})`);
        } else {
          toast.error(
            data.statusCode
              ? `Test failed (${data.statusCode})`
              : "Test failed — could not reach URL"
          );
        }
      },
    })
  );

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={webhook.enabled}
        onCheckedChange={(enabled) =>
          toggleMutation.mutate({ id: webhook.id, enabled })
        }
        disabled={toggleMutation.isPending}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => testMutation.mutate({ id: webhook.id })}
            disabled={testMutation.isPending}
          >
            <Play className="size-4" />
            Send test
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => deleteMutation.mutate({ id: webhook.id })}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CreateWebhookDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const createMutation = useMutation(
    trpc.webhooks.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.webhooks.getAll.queryKey(),
        });
        setCreatedSecret(data.secret);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleClose = () => {
    setUrl("");
    setEvents([]);
    setCreatedSecret(null);
    onOpenChange(false);
  };

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  if (createdSecret) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook created</DialogTitle>
            <DialogDescription>
              Copy the signing secret below. It won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-3">
            <code className="break-all text-sm">{createdSecret}</code>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add webhook</DialogTitle>
          <DialogDescription>
            We&apos;ll send a POST request to this URL when events occur.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Events</Label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => (
                <div key={event.value} className="flex items-center gap-2">
                  <Checkbox
                    id={event.value}
                    checked={events.includes(event.value)}
                    onCheckedChange={() => toggleEvent(event.value)}
                  />
                  <Label
                    htmlFor={event.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {event.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              createMutation.mutate({
                url,
                events: events as ("generation.completed" | "generation.failed")[],
              })
            }
            disabled={!url || events.length === 0 || createMutation.isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WebhooksPanel() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const trpc = useTRPC();
  const { data: webhooks } = useSuspenseQuery(
    trpc.webhooks.getAll.queryOptions()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Webhook className="size-4" />
            Webhooks
          </h3>
          <p className="text-xs text-muted-foreground">
            Receive POST notifications when events occur
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-3.5" />
          Add webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Globe className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No webhooks configured</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a webhook to receive real-time notifications.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="size-3.5" />
            Add webhook
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Events</TableHead>
              <TableHead className="w-36 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell>
                  <code className="text-xs font-mono break-all">
                    {webhook.url}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <WebhookActions webhook={webhook} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateWebhookDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
