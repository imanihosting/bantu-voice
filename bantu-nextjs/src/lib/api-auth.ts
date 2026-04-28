import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashApiKey } from "@/lib/api-keys";

interface ApiKeyAuth {
  orgId: string;
  apiKeyId: string;
}

/**
 * Authenticate a REST API request using a Bearer token.
 * Extracts the API key from the Authorization header, hashes it,
 * and looks it up in the database. Returns null if invalid.
 */
export async function authenticateApiKey(
  request: Request
): Promise<ApiKeyAuth | null> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const plaintext = authorization.slice(7);

  if (!plaintext.startsWith("tk_")) {
    return null;
  }

  const keyHash = hashApiKey(plaintext);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, orgId: true, revokedAt: true },
  });

  if (!apiKey || apiKey.revokedAt) {
    return null;
  }

  // Update lastUsedAt in the background (fire-and-forget)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return { orgId: apiKey.orgId, apiKeyId: apiKey.id };
}

/**
 * Return a JSON error response for REST API endpoints.
 */
export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: { message } }, { status });
}

/**
 * Return a JSON success response for REST API endpoints.
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json({ data }, { status });
}
