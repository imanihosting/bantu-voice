import { z } from "zod";
import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { createTRPCRouter, orgProcedure } from "../init";

const WEBHOOK_EVENTS = [
  "generation.completed",
  "generation.failed",
] as const;

export const webhooksRouter = createTRPCRouter({
  getAll: orgProcedure.query(async ({ ctx }) => {
    return prisma.webhook.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: orgProcedure
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(z.enum(WEBHOOK_EVENTS)).min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const secret = `whsec_${randomBytes(24).toString("hex")}`;

      const webhook = await prisma.webhook.create({
        data: {
          orgId: ctx.orgId,
          url: input.url,
          events: input.events,
          secret,
        },
      });

      // Return the secret ONCE so the user can copy it
      return { id: webhook.id, secret };
    }),

  update: orgProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().optional(),
        events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const webhook = await prisma.webhook.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true },
      });

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      await prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          ...(input.url !== undefined && { url: input.url }),
          ...(input.events !== undefined && { events: input.events }),
          ...(input.enabled !== undefined && { enabled: input.enabled }),
        },
      });

      return { success: true };
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const webhook = await prisma.webhook.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true },
      });

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      await prisma.webhook.delete({ where: { id: webhook.id } });

      return { success: true };
    }),

  test: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const webhook = await prisma.webhook.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
      });

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "test",
            timestamp: new Date().toISOString(),
            data: { message: "This is a test webhook from TaurAI." },
          }),
          signal: AbortSignal.timeout(10000),
        });

        return { success: response.ok, statusCode: response.status };
      } catch {
        return { success: false, statusCode: 0 };
      }
    }),
});
