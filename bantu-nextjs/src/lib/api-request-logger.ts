import { prisma } from "@/lib/db";

/**
 * Log an API request. Fire-and-forget — never blocks the response.
 */
export function logApiRequest(params: {
  orgId: string;
  apiKeyId: string | null;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  error?: string;
}) {
  prisma.apiRequestLog
    .create({
      data: {
        orgId: params.orgId,
        apiKeyId: params.apiKeyId,
        method: params.method,
        path: params.path,
        statusCode: params.statusCode,
        durationMs: params.durationMs,
        error: params.error ?? null,
      },
    })
    .catch(() => {});
}
