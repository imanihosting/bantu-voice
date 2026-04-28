import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { generateApiKey, hashApiKey, getKeyPrefix } from "@/lib/api-keys";
import { createTRPCRouter, orgProcedure } from "../init";

export const apiKeysRouter = createTRPCRouter({
  getAll: orgProcedure.query(async ({ ctx }) => {
    const keys = await prisma.apiKey.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });

    return keys;
  }),

  create: orgProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const plaintext = generateApiKey();
      const keyHash = hashApiKey(plaintext);
      const keyPrefix = getKeyPrefix(plaintext);

      await prisma.apiKey.create({
        data: {
          orgId: ctx.orgId,
          name: input.name,
          keyHash,
          keyPrefix,
        },
      });

      // Return the plaintext key ONCE — it cannot be retrieved again
      return { key: plaintext };
    }),

  revoke: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const apiKey = await prisma.apiKey.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true, revokedAt: true },
      });

      if (!apiKey) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }

      if (apiKey.revokedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "API key already revoked" });
      }

      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { revokedAt: new Date() },
      });

      return { success: true };
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const apiKey = await prisma.apiKey.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true },
      });

      if (!apiKey) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }

      await prisma.apiKey.delete({ where: { id: apiKey.id } });

      return { success: true };
    }),
});
