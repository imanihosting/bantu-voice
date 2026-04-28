import { authenticateApiKey, apiError, apiSuccess } from "@/lib/api-auth";
import { logApiRequest } from "@/lib/api-request-logger";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/storage";
import { env } from "@/lib/env";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_TYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/flac",
  "audio/ogg",
  "audio/webm",
]);

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
      path: "/api/v1/transcriptions",
      statusCode,
      durationMs: Date.now() - startTime,
      error,
    });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    log(400, "Invalid form data");
    return apiError("Request must be multipart/form-data with a file field", 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    log(400, "Missing file field");
    return apiError("Missing required 'file' field", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    log(413, "File too large");
    return apiError(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB`, 413);
  }

  if (file.size === 0) {
    log(400, "Empty file");
    return apiError("Empty audio file", 400);
  }

  const language = formData.get("language");
  const languageStr = typeof language === "string" && language.length > 0 ? language : undefined;

  // Forward to BantuVoice /transcribe
  const transcribeForm = new FormData();
  transcribeForm.append("file", file);
  if (languageStr) {
    transcribeForm.append("language", languageStr);
  }

  let transcribeResult: {
    text: string;
    language: string;
    duration_seconds: number;
    segments: { start: number; end: number; text: string }[];
  };

  try {
    const response = await fetch(`${env.BANTUVOICE_API_URL}/transcribe`, {
      method: "POST",
      headers: {
        "x-api-key": env.BANTUVOICE_API_KEY,
      },
      body: transcribeForm,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      log(502, `BantuVoice transcribe failed: ${response.status}`);
      return apiError(`Transcription failed: ${errText}`, 502);
    }

    transcribeResult = await response.json();
  } catch (err) {
    log(502, `BantuVoice connection error: ${err}`);
    return apiError("Failed to connect to transcription service", 502);
  }

  // Upload source audio to S3
  let sourceAudioKey: string | null = null;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const transcription = await prisma.transcription.create({
      data: {
        orgId: auth.orgId,
        originalFileName: file.name || null,
        text: transcribeResult.text,
        language: transcribeResult.language,
        durationSeconds: transcribeResult.duration_seconds,
        segments: transcribeResult.segments,
      },
      select: { id: true, createdAt: true },
    });

    sourceAudioKey = `transcriptions/orgs/${auth.orgId}/${transcription.id}`;
    await uploadAudio({ buffer, key: sourceAudioKey });

    await prisma.transcription.update({
      where: { id: transcription.id },
      data: { sourceAudioKey },
    });

    log(200);
    return apiSuccess({
      id: transcription.id,
      text: transcribeResult.text,
      language: transcribeResult.language,
      durationSeconds: transcribeResult.duration_seconds,
      segments: transcribeResult.segments,
      createdAt: transcription.createdAt,
    });
  } catch (err) {
    log(500, `Storage error: ${err}`);
    return apiError("Failed to store transcription", 500);
  }
}

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
      path: "/api/v1/transcriptions",
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

  const [transcriptions, total] = await Promise.all([
    prisma.transcription.findMany({
      where: { orgId: auth.orgId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      omit: {
        orgId: true,
        sourceAudioKey: true,
      },
    }),
    prisma.transcription.count({
      where: { orgId: auth.orgId },
    }),
  ]);

  log(200);
  return NextResponse.json({
    data: transcriptions,
    meta: { total, page, limit },
  });
}
