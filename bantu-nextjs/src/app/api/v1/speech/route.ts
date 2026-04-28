import { z } from "zod";
import { authenticateApiKey, apiError, apiSuccess } from "@/lib/api-auth";
import { logApiRequest } from "@/lib/api-request-logger";
import { bantuvoice } from "@/lib/bantuvoice-client";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/storage";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";
import { getLanguageId } from "@/features/voices/data/supported-languages";

const speechInput = z.object({
  text: z.string().min(1).max(TEXT_MAX_LENGTH),
  voiceId: z.string().min(1),
  // BCP-47 tag (e.g. "zu-ZA") to override the voice's own language.
  language: z.string().min(1).optional(),
  numStep: z.number().int().min(4).max(64).default(32),
  guidanceScale: z.number().min(0).max(4).default(2.0),
  speed: z.number().min(0.25).max(2).default(1.0),
  duration: z.number().min(0).max(60).optional(),
});

export async function POST(request: Request) {
  const startTime = Date.now();
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  const log = (statusCode: number, error?: string) =>
    logApiRequest({
      orgId: auth.orgId,
      apiKeyId: auth.apiKeyId,
      method: "POST",
      path: "/api/v1/speech",
      statusCode,
      durationMs: Date.now() - startTime,
      error,
    });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log(400, "Invalid JSON body");
    return apiError("Invalid JSON body", 400);
  }

  const parsed = speechInput.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    log(400, msg);
    return apiError(msg, 400);
  }

  const input = parsed.data;

  // Validate voice exists and belongs to org (or is SYSTEM)
  const voice = await prisma.voice.findUnique({
    where: {
      id: input.voiceId,
      OR: [
        { variant: "SYSTEM" },
        { variant: "CUSTOM", orgId: auth.orgId },
      ],
    },
    select: {
      id: true,
      name: true,
      r2ObjectKey: true,
      language: true,
    },
  });

  if (!voice) {
    log(404, "Voice not found");
    return apiError("Voice not found", 404);
  }

  if (!voice.r2ObjectKey) {
    log(422, "Voice audio not available");
    return apiError("Voice audio not available", 422);
  }

  // Call BantuVoice TTS
  const effectiveLanguageBcp47 = input.language ?? voice.language;
  const { data, error } = await bantuvoice.POST("/generate", {
    body: {
      prompt: input.text,
      voice_key: voice.r2ObjectKey,
      language_id: getLanguageId(effectiveLanguageBcp47),
      num_step: input.numStep,
      guidance_scale: input.guidanceScale,
      speed: input.speed,
      duration: input.duration,
    },
    parseAs: "arrayBuffer",
  });

  if (error || !(data instanceof ArrayBuffer)) {
    log(502, "Failed to generate audio");
    return apiError("Failed to generate audio", 502);
  }

  const buffer = Buffer.from(data);
  let generationId: string | null = null;

  try {
    const generation = await prisma.generation.create({
      data: {
        orgId: auth.orgId,
        text: input.text,
        voiceName: voice.name,
        voiceId: voice.id,
        language: input.language,
        numStep: input.numStep,
        guidanceScale: input.guidanceScale,
        speed: input.speed,
        duration: input.duration,
      },
      select: { id: true, createdAt: true },
    });

    generationId = generation.id;
    const r2ObjectKey = `generations/orgs/${auth.orgId}/${generation.id}`;

    await uploadAudio({ buffer, key: r2ObjectKey });

    await prisma.generation.update({
      where: { id: generation.id },
      data: { r2ObjectKey },
    });

    log(200);
    return apiSuccess({
      id: generation.id,
      voiceName: voice.name,
      text: input.text,
      audioUrl: `/api/audio/${generation.id}`,
      createdAt: generation.createdAt,
    });
  } catch {
    if (generationId) {
      await prisma.generation
        .delete({ where: { id: generationId } })
        .catch(() => {});
    }
    log(500, "Failed to store generated audio");
    return apiError("Failed to store generated audio", 500);
  }
}
