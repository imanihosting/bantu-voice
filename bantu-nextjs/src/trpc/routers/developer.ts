import { z } from "zod";
import { prisma } from "@/lib/db";
import { createTRPCRouter, orgProcedure } from "../init";

export const developerRouter = createTRPCRouter({
  getOverviewStats: orgProcedure.query(async ({ ctx }) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalRequests, errorCount, avgDuration, activeKeys] =
      await Promise.all([
        prisma.apiRequestLog.count({
          where: { orgId: ctx.orgId, createdAt: { gte: sevenDaysAgo } },
        }),
        prisma.apiRequestLog.count({
          where: {
            orgId: ctx.orgId,
            createdAt: { gte: sevenDaysAgo },
            statusCode: { gte: 400 },
          },
        }),
        prisma.apiRequestLog.aggregate({
          where: { orgId: ctx.orgId, createdAt: { gte: sevenDaysAgo } },
          _avg: { durationMs: true },
        }),
        prisma.apiKey.count({
          where: { orgId: ctx.orgId, revokedAt: null },
        }),
      ]);

    const successRate =
      totalRequests > 0
        ? Math.round(((totalRequests - errorCount) / totalRequests) * 1000) / 10
        : 100;

    return {
      totalRequests,
      successRate,
      avgDurationMs: Math.round(avgDuration._avg.durationMs ?? 0),
      activeKeys,
    };
  }),

  getAnalytics: orgProcedure
    .input(
      z
        .object({
          days: z.number().min(1).max(90).default(30),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const days = input?.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const logs = await prisma.apiRequestLog.findMany({
        where: { orgId: ctx.orgId, createdAt: { gte: since } },
        select: {
          createdAt: true,
          statusCode: true,
          durationMs: true,
          path: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by date
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

      return { daily, endpoints };
    }),

  getRequestLogs: orgProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        method: z.string().optional(),
        path: z.string().optional(),
        status: z.enum(["success", "error"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const statusFilter =
        input.status === "success"
          ? { statusCode: { lt: 400 } }
          : input.status === "error"
            ? { statusCode: { gte: 400 } }
            : {};

      const logs = await prisma.apiRequestLog.findMany({
        where: {
          orgId: ctx.orgId,
          ...(input.method && { method: input.method }),
          ...(input.path && { path: { contains: input.path } }),
          ...statusFilter,
          ...(input.cursor && { id: { lt: input.cursor } }),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        select: {
          id: true,
          apiKeyId: true,
          method: true,
          path: true,
          statusCode: true,
          durationMs: true,
          error: true,
          createdAt: true,
        },
      });

      const hasMore = logs.length > input.limit;
      const items = hasMore ? logs.slice(0, -1) : logs;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return { items, nextCursor };
    }),
});
