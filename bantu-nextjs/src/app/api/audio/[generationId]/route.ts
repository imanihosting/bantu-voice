import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getSignedAudioUrl } from "@/lib/storage";
import { env } from "@/lib/env";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ generationId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const orgId = (session.user as Record<string, unknown>).orgId as string;

  const { generationId } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format");

  const generation = await prisma.generation.findUnique({
    where: { id: generationId, orgId },
  });

  if (!generation) {
    return new Response("Not found", { status: 404 });
  }

  if (!generation.r2ObjectKey) {
    return new Response("Audio is not available yet", { status: 409 });
  }

  const signedUrl = await getSignedAudioUrl(generation.r2ObjectKey);
  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    return new Response("Failed to fetch audio", { status: 502 });
  }

  if (format === "mp3") {
    const wavBuffer = await audioResponse.arrayBuffer();

    const convertResponse = await fetch(
      `${env.BANTUVOICE_API_URL}/convert`,
      {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "x-api-key": env.BANTUVOICE_API_KEY,
        },
        body: wavBuffer,
      },
    );

    if (!convertResponse.ok) {
      return new Response("Failed to convert audio", { status: 502 });
    }

    return new Response(convertResponse.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
