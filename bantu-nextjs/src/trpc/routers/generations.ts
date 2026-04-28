import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { bantuvoice } from "@/lib/bantuvoice-client";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/storage";
import { TEXT_MAX_LENGTH, BATCH_MAX_PARAGRAPHS } from "@/features/text-to-speech/data/constants";
import { getLanguageId } from "@/features/voices/data/supported-languages";
import { createTRPCRouter, orgProcedure } from "../init";

export const generationsRouter = createTRPCRouter({
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const generation = await prisma.generation.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        omit: {
          orgId: true,
          r2ObjectKey: true,
        },
      });

      if (!generation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...generation,
        audioUrl: `/api/audio/${generation.id}`,
      };
    }),

  getAll: orgProcedure.query(async ({ ctx }) => {
    const generations = await prisma.generation.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      omit: {
        orgId: true,
        r2ObjectKey: true,
      },
    });

    return generations;
  }),

  create: orgProcedure
    .input(
      z.object({
        text: z.string().min(1).max(TEXT_MAX_LENGTH),
        voiceId: z.string().min(1),
        // BCP-47 tag (e.g. "zu-ZA") to override the voice's own language.
        language: z.string().min(1).optional(),
        numStep: z.number().int().min(4).max(64).default(32),
        guidanceScale: z.number().min(0).max(4).default(2.0),
        speed: z.number().min(0.25).max(2).default(1.0),
        duration: z.number().min(0).max(60).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const voice = await prisma.voice.findUnique({
        where: {
          id: input.voiceId,
          OR: [
            { variant: "SYSTEM" },
            { variant: "CUSTOM", orgId: ctx.orgId, }
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (!voice.r2ObjectKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice audio not available",
        });
      }

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

      console.log("Generation started", {
        orgId: ctx.orgId,
        voiceId: input.voiceId,
        language: effectiveLanguageBcp47,
        textLength: input.text.length,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate audio",
        });
      }

      if (!(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid audio response",
        });
      }

      const buffer = Buffer.from(data);
      let generationId: string | null = null;
      let r2ObjectKey: string | null = null;

      try {
        const generation = await prisma.generation.create({
          data: {
            orgId: ctx.orgId,
            text: input.text,
            voiceName: voice.name,
            voiceId: voice.id,
            language: input.language,
            numStep: input.numStep,
            guidanceScale: input.guidanceScale,
            speed: input.speed,
            duration: input.duration,
          },
          select: {
            id: true,
          },
        });

        generationId = generation.id;
        r2ObjectKey = `generations/orgs/${ctx.orgId}/${generation.id}`;

        await uploadAudio({ buffer, key: r2ObjectKey });

        await prisma.generation.update({
          where: {
            id: generation.id,
          },
          data: {
            r2ObjectKey,
          },
        });

        console.log("Audio generated", {
          orgId: ctx.orgId,
          generationId: generation.id,
        });
      } catch {
        if (generationId) {
          await prisma.generation
            .delete({
              where: {
                id: generationId,
              },
            })
            .catch(() => {});
        }

        console.error("Generation failed", {
          orgId: ctx.orgId,
          voiceId: input.voiceId,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      if (!generationId || !r2ObjectKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      return {
        id: generationId,
      };
    }),

  createBatch: orgProcedure
    .input(
      z.object({
        paragraphs: z
          .array(z.string().min(1).max(TEXT_MAX_LENGTH))
          .min(1)
          .max(BATCH_MAX_PARAGRAPHS),
        voiceId: z.string().min(1),
        language: z.string().min(1).optional(),
        numStep: z.number().int().min(4).max(64).default(32),
        guidanceScale: z.number().min(0).max(4).default(2.0),
        speed: z.number().min(0.25).max(2).default(1.0),
        duration: z.number().min(0).max(60).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const voice = await prisma.voice.findUnique({
        where: {
          id: input.voiceId,
          OR: [
            { variant: "SYSTEM" },
            { variant: "CUSTOM", orgId: ctx.orgId },
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (!voice.r2ObjectKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice audio not available",
        });
      }

      const results: { index: number; id: string; error?: string }[] = [];

      for (let i = 0; i < input.paragraphs.length; i++) {
        const text = input.paragraphs[i].trim();
        if (!text) continue;

        try {
          const effectiveLanguageBcp47 = input.language ?? voice.language;
          const { data, error } = await bantuvoice.POST("/generate", {
            body: {
              prompt: text,
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
            results.push({ index: i, id: "", error: "Failed to generate audio" });
            continue;
          }

          const buffer = Buffer.from(data);
          const generation = await prisma.generation.create({
            data: {
              orgId: ctx.orgId,
              text,
              voiceName: voice.name,
              voiceId: voice.id,
              language: input.language,
              numStep: input.numStep,
              guidanceScale: input.guidanceScale,
              speed: input.speed,
              duration: input.duration,
            },
            select: { id: true },
          });

          const r2ObjectKey = `generations/orgs/${ctx.orgId}/${generation.id}`;
          await uploadAudio({ buffer, key: r2ObjectKey });
          await prisma.generation.update({
            where: { id: generation.id },
            data: { r2ObjectKey },
          });

          results.push({ index: i, id: generation.id });
        } catch {
          console.error("Batch generation failed", {
            orgId: ctx.orgId,
            paragraphIndex: i,
          });
          results.push({ index: i, id: "", error: "Generation failed" });
        }
      }

      console.log("Batch generation completed", {
        orgId: ctx.orgId,
        total: input.paragraphs.length,
        succeeded: results.filter((r) => !r.error).length,
        failed: results.filter((r) => r.error).length,
      });

      return { results };
    }),

  createMultiSpeaker: orgProcedure
    .input(
      z.object({
        script: z
          .array(
            z.object({
              speaker: z.number().int().min(1).max(4),
              text: z.string().min(1).max(TEXT_MAX_LENGTH),
            })
          )
          .min(1)
          .max(100),
        voiceIds: z.record(z.string(), z.string().min(1)),
        cfgWeight: z.number().min(0).max(1).default(0.5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Resolve all unique speakers and their voices
      const speakerNumbers = [...new Set(input.script.map((l) => l.speaker))];

      const voiceMap: Record<
        string,
        { id: string; name: string; r2ObjectKey: string }
      > = {};

      for (const spk of speakerNumbers) {
        const voiceId = input.voiceIds[String(spk)];
        if (!voiceId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Missing voiceId for speaker ${spk}`,
          });
        }

        const voice = await prisma.voice.findUnique({
          where: {
            id: voiceId,
            OR: [
              { variant: "SYSTEM" },
              { variant: "CUSTOM", orgId: ctx.orgId },
            ],
          },
          select: {
            id: true,
            name: true,
            r2ObjectKey: true,
          },
        });

        if (!voice) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Voice not found for speaker ${spk}`,
          });
        }

        if (!voice.r2ObjectKey) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `Voice audio not available for speaker ${spk}`,
          });
        }

        voiceMap[String(spk)] = {
          id: voice.id,
          name: voice.name,
          r2ObjectKey: voice.r2ObjectKey,
        };
      }

      // Build voice_keys map for the backend (speaker number -> S3 key)
      const voiceKeys: Record<string, string> = {};
      for (const [spk, voice] of Object.entries(voiceMap)) {
        voiceKeys[spk] = voice.r2ObjectKey;
      }

      // Call the VibeVoice multi-speaker endpoint
      const { data, error } = await bantuvoice.POST("/generate-multi", {
        body: {
          script: input.script.map((line) => ({
            speaker: line.speaker,
            text: line.text,
          })),
          voice_keys: voiceKeys,
          cfg_weight: input.cfgWeight,
        },
        parseAs: "arrayBuffer",
      });

      console.log("Multi-speaker generation started", {
        orgId: ctx.orgId,
        speakers: speakerNumbers,
        lines: input.script.length,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate multi-speaker audio",
        });
      }

      if (!(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid audio response",
        });
      }

      const buffer = Buffer.from(data);

      // Build a combined text summary for the generation record
      const combinedText = input.script
        .map((l) => `Speaker ${l.speaker}: ${l.text}`)
        .join("\n");

      // Use the first speaker's voice as the primary voice record
      const primaryVoice = voiceMap[String(speakerNumbers[0])];

      let generationId: string | null = null;
      let r2ObjectKey: string | null = null;

      try {
        const generation = await prisma.generation.create({
          data: {
            orgId: ctx.orgId,
            text: combinedText.slice(0, TEXT_MAX_LENGTH),
            voiceName: speakerNumbers
              .map((s) => `${voiceMap[String(s)].name} (Speaker ${s})`)
              .join(", "),
            voiceId: primaryVoice.id,
            temperature: 0.8,
            topP: 1.0,
            exaggeration: 0.5,
            repetitionPenalty: 2.0,
          },
          select: { id: true },
        });

        generationId = generation.id;
        r2ObjectKey = `generations/orgs/${ctx.orgId}/${generation.id}`;

        await uploadAudio({ buffer, key: r2ObjectKey });

        await prisma.generation.update({
          where: { id: generation.id },
          data: { r2ObjectKey },
        });

        console.log("Multi-speaker audio generated", {
          orgId: ctx.orgId,
          generationId: generation.id,
          speakers: speakerNumbers.length,
        });
      } catch {
        if (generationId) {
          await prisma.generation
            .delete({ where: { id: generationId } })
            .catch(() => {});
        }

        console.error("Multi-speaker generation failed", {
          orgId: ctx.orgId,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      if (!generationId || !r2ObjectKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      return { id: generationId };
    }),
});
