import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CodeBlock } from "./code-block";

interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

interface ErrorCode {
  status: number;
  description: string;
}

interface EndpointSectionProps {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  parameters?: Parameter[];
  requestExample?: string;
  responseExample?: string;
  errorCodes?: ErrorCode[];
}

const methodColors: Record<string, string> = {
  GET: "bg-green-500/10 text-green-700 border-green-500/20",
  POST: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  PATCH: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  DELETE: "bg-red-500/10 text-red-700 border-red-500/20",
};

export function EndpointSection({
  method,
  path,
  description,
  parameters,
  requestExample,
  responseExample,
  errorCodes,
}: EndpointSectionProps) {
  return (
    <div className="space-y-4">
      {/* Method + Path */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
        <Badge
          variant="outline"
          className={`font-mono font-bold text-xs ${methodColors[method]}`}
        >
          {method}
        </Badge>
        <code className="text-sm font-mono font-medium">{path}</code>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Parameters table */}
      {parameters && parameters.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Parameters</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Name</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead className="w-24">Required</TableHead>
                <TableHead className="w-24">Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.map((param) => (
                <TableRow key={param.name}>
                  <TableCell>
                    <code className="text-xs font-mono">{param.name}</code>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {param.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {param.required ? (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Optional
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {param.default ? (
                      <code className="text-xs font-mono">
                        {param.default}
                      </code>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {param.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Request example */}
      {requestExample && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Request Example</h4>
          <CodeBlock code={requestExample} language="bash" />
        </div>
      )}

      {/* Response example */}
      {responseExample && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Response Example</h4>
          <CodeBlock code={responseExample} language="json" />
        </div>
      )}

      {/* Error codes */}
      {errorCodes && errorCodes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Error Codes</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorCodes.map((err) => (
                <TableRow key={err.status}>
                  <TableCell>
                    <code className="text-xs font-mono">{err.status}</code>
                  </TableCell>
                  <TableCell className="text-xs">{err.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
