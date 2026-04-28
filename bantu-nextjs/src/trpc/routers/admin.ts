import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";

import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { securityAlertEmail } from "@/lib/email-templates";
import { createTRPCRouter, adminProcedure } from "../init";

export const adminRouter = createTRPCRouter({
  getOverview: adminProcedure.query(async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalGenerations,
      totalTranscriptions,
      totalApiRequests,
      activeUsers,
      systemVoices,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.generation.count(),
      prisma.transcription.count(),
      prisma.apiRequestLog.count(),
      prisma.user.count({
        where: { updatedAt: { gte: sevenDaysAgo } },
      }),
      prisma.voice.count({ where: { variant: "SYSTEM" } }),
    ]);

    return {
      totalUsers,
      totalGenerations,
      totalTranscriptions,
      totalApiRequests,
      activeUsers,
      systemVoices,
    };
  }),

  getUsers: adminProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
        banned: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const where = {
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { email: { contains: input.search, mode: "insensitive" as const } },
          ],
        }),
        ...(input.role && { role: input.role }),
        ...(input.banned !== undefined && { banned: input.banned }),
      };

      const users = await prisma.user.findMany({
        where: {
          ...where,
          ...(input.cursor && { id: { lt: input.cursor } }),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          banned: true,
          banReason: true,
          createdAt: true,
          _count: {
            select: {
              sessions: true,
            },
          },
        },
      });

      const hasMore = users.length > input.limit;
      const items = hasMore ? users.slice(0, -1) : users;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor };
    }),

  getUserDetail: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          orgId: true,
          role: true,
          banned: true,
          banReason: true,
          banExpires: true,
          twoFactorEnabled: true,
          phone: true,
          street: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const [generationCount, transcriptionCount, apiKeyCount] =
        await Promise.all([
          prisma.generation.count({ where: { orgId: user.orgId } }),
          prisma.transcription.count({ where: { orgId: user.orgId } }),
          prisma.apiKey.count({
            where: { orgId: user.orgId, revokedAt: null },
          }),
        ]);

      return {
        ...user,
        generationCount,
        transcriptionCount,
        apiKeyCount,
      };
    }),

  setUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change your own role",
        });
      }

      await prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      return { success: true };
    }),

  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot ban yourself",
        });
      }

      await prisma.user.update({
        where: { id: input.userId },
        data: {
          banned: true,
          banReason: input.reason,
        },
      });

      return { success: true };
    }),

  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.user.update({
        where: { id: input.userId },
        data: {
          banned: false,
          banReason: null,
          banExpires: null,
        },
      });

      return { success: true };
    }),

  resetUserPassword: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot reset your own password from admin panel",
        });
      }

      const account = await prisma.account.findFirst({
        where: { userId: input.userId, providerId: "credential" },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No credential account found for this user",
        });
      }

      const hashedPassword = await hashPassword(input.newPassword);

      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword },
      });

      // Invalidate all user sessions so they must sign in with new password
      await prisma.session.deleteMany({
        where: { userId: input.userId },
      });

      // Notify the user that their password was reset by an admin
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { name: true, email: true },
      });

      if (user) {
        try {
          const template = securityAlertEmail({
            name: user.name || "there",
            event: "Your password was reset by an administrator",
            timestamp: new Date().toUTCString(),
            loginUrl: `${process.env.APP_URL ?? ""}/sign-in`,
          });
          await sendMail({
            to: user.email,
            subject: template.subject,
            html: template.html,
          });
        } catch (err) {
          console.error("[admin] Failed to send password reset notification:", err);
        }
      }

      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete yourself",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { orgId: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Delete all org-scoped data, then the user
      await prisma.$transaction([
        prisma.apiRequestLog.deleteMany({ where: { orgId: user.orgId } }),
        prisma.webhook.deleteMany({ where: { orgId: user.orgId } }),
        prisma.apiKey.deleteMany({ where: { orgId: user.orgId } }),
        prisma.generation.deleteMany({ where: { orgId: user.orgId } }),
        prisma.transcription.deleteMany({ where: { orgId: user.orgId } }),
        prisma.voice.deleteMany({
          where: { orgId: user.orgId, variant: "CUSTOM" },
        }),
        prisma.twoFactor.deleteMany({ where: { userId: input.userId } }),
        prisma.session.deleteMany({ where: { userId: input.userId } }),
        prisma.account.deleteMany({ where: { userId: input.userId } }),
        prisma.user.delete({ where: { id: input.userId } }),
      ]);

      return { success: true };
    }),

  getPlatformAnalytics: adminProcedure
    .input(
      z
        .object({
          days: z.number().min(1).max(90).default(30),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const days = input?.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [logs, userSignups] = await Promise.all([
        prisma.apiRequestLog.findMany({
          where: { createdAt: { gte: since } },
          select: {
            createdAt: true,
            statusCode: true,
            durationMs: true,
            path: true,
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.user.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

      // Group API requests by date
      const byDate = new Map<
        string,
        { requests: number; errors: number; totalDuration: number }
      >();

      for (const log of logs) {
        const date = log.createdAt.toISOString().split("T")[0];
        const entry = byDate.get(date) ?? {
          requests: 0,
          errors: 0,
          totalDuration: 0,
        };
        entry.requests++;
        if (log.statusCode >= 400) entry.errors++;
        entry.totalDuration += log.durationMs;
        byDate.set(date, entry);
      }

      const daily = Array.from(byDate.entries()).map(([date, stats]) => ({
        date,
        requests: stats.requests,
        errors: stats.errors,
        avgDurationMs: Math.round(stats.totalDuration / stats.requests),
      }));

      // Group by endpoint
      const byEndpoint = new Map<string, number>();
      for (const log of logs) {
        byEndpoint.set(log.path, (byEndpoint.get(log.path) ?? 0) + 1);
      }

      const endpoints = Array.from(byEndpoint.entries())
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);

      // Group signups by date
      const signupsByDate = new Map<string, number>();
      for (const user of userSignups) {
        const date = user.createdAt.toISOString().split("T")[0];
        signupsByDate.set(date, (signupsByDate.get(date) ?? 0) + 1);
      }

      const signups = Array.from(signupsByDate.entries()).map(
        ([date, count]) => ({ date, count })
      );

      return { daily, endpoints, signups };
    }),

  getSystemVoices: adminProcedure.query(async () => {
    return prisma.voice.findMany({
      where: { variant: "SYSTEM" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        language: true,
        createdAt: true,
        _count: {
          select: { generations: true },
        },
      },
    });
  }),

  deleteSystemVoice: adminProcedure
    .input(z.object({ voiceId: z.string() }))
    .mutation(async ({ input }) => {
      const voice = await prisma.voice.findUnique({
        where: { id: input.voiceId },
        select: { variant: true },
      });

      if (!voice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Voice not found" });
      }

      if (voice.variant !== "SYSTEM") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only delete system voices from admin panel",
        });
      }

      await prisma.voice.delete({ where: { id: input.voiceId } });

      return { success: true };
    }),

  getRecentActivity: adminProcedure.query(async () => {
    const [recentUsers, recentGenerations, recentTranscriptions] =
      await Promise.all([
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        }),
        prisma.generation.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            voiceName: true,
            text: true,
            createdAt: true,
          },
        }),
        prisma.transcription.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            language: true,
            durationSeconds: true,
            createdAt: true,
          },
        }),
      ]);

    return { recentUsers, recentGenerations, recentTranscriptions };
  }),
});
