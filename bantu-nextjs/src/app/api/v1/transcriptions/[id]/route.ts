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
      path: `/api/v1/transcriptions/${id}`,
      statusCode,
      durationMs: Date.now() - startTime,
      error,
    });

  const transcription = await prisma.transcription.findUnique({
    where: { id, orgId: auth.orgId },
    omit: {
      orgId: true,
      sourceAudioKey: true,
    },
  });

  if (!transcription) {
    log(404, "Transcription not found");
    return apiError("Transcription not found", 404);
  }

  log(200);
  return apiSuccess(transcription);
}
