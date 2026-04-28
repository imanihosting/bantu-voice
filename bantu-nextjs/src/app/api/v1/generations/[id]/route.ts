import { authenticateApiKey, apiError, apiSuccess } from "@/lib/api-auth";
import { logApiRequest } from "@/lib/api-request-logger";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  const { id } = await params;

  const log = (statusCode: number, error?: string) =>
    logApiRequest({
      orgId: auth.orgId,
      apiKeyId: auth.apiKeyId,
      method: "GET",
      path: `/api/v1/generations/${id}`,
      statusCode,
      durationMs: Date.now() - startTime,
      error,
    });

  const generation = await prisma.generation.findUnique({
    where: { id, orgId: auth.orgId },
    omit: {
      orgId: true,
      r2ObjectKey: true,
    },
  });

  if (!generation) {
    log(404, "Generation not found");
    return apiError("Generation not found", 404);
  }

  log(200);
  return apiSuccess({
    ...generation,
    audioUrl: `/api/audio/${generation.id}`,
  });
}
