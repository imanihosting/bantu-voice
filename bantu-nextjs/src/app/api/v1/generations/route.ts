import { authenticateApiKey, apiError } from "@/lib/api-auth";
import { logApiRequest } from "@/lib/api-request-logger";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

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
      path: "/api/v1/generations",
      statusCode,
      durationMs: Date.now() - startTime,
      error,
    });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
  );
  const skip = (page - 1) * limit;

  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where: { orgId: auth.orgId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      omit: {
        orgId: true,
        r2ObjectKey: true,
      },
    }),
    prisma.generation.count({
      where: { orgId: auth.orgId },
    }),
  ]);

  const data = generations.map((g) => ({
    ...g,
    audioUrl: `/api/audio/${g.id}`,
  }));

  log(200);
  return NextResponse.json({
    data,
    meta: { total, page, limit },
  });
}
