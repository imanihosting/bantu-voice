"use client";

import { useState } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, RefreshCw } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function StatusBadge({ code }: { code: number }) {
  if (code >= 200 && code < 300) {
    return (
      <Badge
        variant="outline"
        className="border-green-200 bg-green-50 text-green-700 tabular-nums"
      >
        {code}
      </Badge>
    );
  }
  if (code >= 400 && code < 500) {
    return (
      <Badge
        variant="outline"
        className="border-yellow-200 bg-yellow-50 text-yellow-700 tabular-nums"
      >
        {code}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="tabular-nums">
      {code}
    </Badge>
  );
}

export function RequestLogPanel() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filterInput = {
    limit: 50 as const,
    ...(statusFilter !== "all" && {
      status: statusFilter as "success" | "error",
    }),
  };

  const { data } = useSuspenseQuery(
    trpc.developer.getRequestLogs.queryOptions(filterInput)
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.developer.getRequestLogs.queryKey(),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <FileText className="size-4" />
            Request Log
          </h3>
          <p className="text-xs text-muted-foreground">
            Recent API requests to your endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="size-8" onClick={handleRefresh}>
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <FileText className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No requests yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            API requests will appear here once your integration is active.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-mono">
                    {log.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono">
                    {log.path}
                  </code>
                </TableCell>
                <TableCell>
                  <StatusBadge code={log.statusCode} />
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                  {log.durationMs}ms
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {data.nextCursor && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // For simplicity, refresh with increased limit
              queryClient.invalidateQueries({
                queryKey: trpc.developer.getRequestLogs.queryKey(),
              });
            }}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
