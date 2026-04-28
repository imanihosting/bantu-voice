import { AudioLines, Database, HardDrive } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ServiceStatus {
  name: string;
  status: "connected" | "disconnected";
  latency: number;
  details?: string;
}

const SERVICE_META: Record<
  string,
  { type: string; icon: React.ElementType }
> = {
  "TTS Engine": { type: "TTS Engine", icon: AudioLines },
  "Storage (MinIO)": { type: "Object Storage", icon: HardDrive },
  Database: { type: "Database", icon: Database },
};

export function ServicesTable({ services }: { services: ServiceStatus[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Latency</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => {
          const meta = SERVICE_META[service.name];
          const Icon = meta?.icon ?? AudioLines;

          return (
            <TableRow key={service.name}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    {service.details && (
                      <p className="text-xs text-muted-foreground">
                        {service.details}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {meta?.type ?? "Service"}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {service.latency}ms
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={
                    service.status === "connected" ? "default" : "destructive"
                  }
                >
                  {service.status === "connected"
                    ? "Connected"
                    : "Disconnected"}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
