import { authenticateApiKey, apiError, apiSuccess } from "@/lib/api-auth";
import { logApiRequest } from "@/lib/api-request-logger";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const startTime = Date.now();
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  const log = (statusCode: number, error?: string) =>
    logApiRequest({
      orgId: auth.orgId,
      apiKeyId: auth.apiKeyId,
      method: "GET",
      path: "/api/v1/voices",
      statusCode,
      durationMs: Date.now() - startTime,
      error,
    });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search")?.trim();

  const searchFilter = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [custom, system] = await Promise.all([
    prisma.voice.findMany({
      where: {
        variant: "CUSTOM",
        orgId: auth.orgId,
        ...searchFilter,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        language: true,
        variant: true,
      },
    }),
    prisma.voice.findMany({
      where: {
        variant: "SYSTEM",
        ...searchFilter,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        language: true,
        variant: true,
      },
    }),
  ]);

  log(200);
  return apiSuccess({ custom, system });
}
