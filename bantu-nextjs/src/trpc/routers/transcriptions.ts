import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/storage";
import { env } from "@/lib/env";
import { createTRPCRouter, orgProcedure } from "../init";

export const transcriptionsRouter = createTRPCRouter({
  getAll: orgProcedure.query(async ({ ctx }) => {
    const transcriptions = await prisma.transcription.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      omit: {
        orgId: true,
        sourceAudioKey: true,
      },
    });

    return transcriptions;
  }),

  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const transcription = await prisma.transcription.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        omit: {
          orgId: true,
          sourceAudioKey: true,
        },
      });

      if (!transcription) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return transcription;
    }),

  create: orgProcedure
    .input(
      z.object({
        audioBase64: z.string().min(1),
        language: z.string().optional(),
        fileName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Decode base64 audio
      const audioBuffer = Buffer.from(input.audioBase64, "base64");

      if (audioBuffer.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Empty audio data",
        });
      }

      if (audioBuffer.length > 25 * 1024 * 1024) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Audio file too large. Maximum size is 25 MB",
        });
      }

      // Forward to BantuVoice /transcribe
      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: "audio/wav" });
      formData.append("file", blob, input.fileName ?? "recording.wav");
      if (input.language) {
        formData.append("language", input.language);
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
          body: formData,
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "Unknown error");
          console.error("BantuVoice transcribe failed", {
            status: response.status,
            error: errText,
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Transcription failed",
          });
        }

        transcribeResult = await response.json();
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("BantuVoice connection error", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect to transcription service",
        });
      }

      // Save to DB and upload source audio to S3
      try {
        const transcription = await prisma.transcription.create({
          data: {
            orgId: ctx.orgId,
            originalFileName: input.fileName ?? null,
            text: transcribeResult.text,
            language: transcribeResult.language,
            durationSeconds: transcribeResult.duration_seconds,
            segments: transcribeResult.segments,
          },
          select: { id: true },
        });

        const sourceAudioKey = `transcriptions/orgs/${ctx.orgId}/${transcription.id}`;
        await uploadAudio({ buffer: audioBuffer, key: sourceAudioKey });

        await prisma.transcription.update({
          where: { id: transcription.id },
          data: { sourceAudioKey },
        });

        console.log("Transcription created", {
          orgId: ctx.orgId,
          transcriptionId: transcription.id,
        });

        return {
          id: transcription.id,
          text: transcribeResult.text,
          language: transcribeResult.language,
          durationSeconds: transcribeResult.duration_seconds,
          segments: transcribeResult.segments,
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("Transcription storage failed", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store transcription",
        });
      }
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const transcription = await prisma.transcription.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true, sourceAudioKey: true },
      });

      if (!transcription) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await prisma.transcription.delete({
        where: { id: transcription.id },
      });

      // Clean up S3 in background
      if (transcription.sourceAudioKey) {
        import("@/lib/storage").then(({ deleteAudio }) =>
          deleteAudio(transcription.sourceAudioKey!).catch(() => {})
        );
      }

      return { id: transcription.id };
    }),
});
