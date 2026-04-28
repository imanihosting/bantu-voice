import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { headers } from "next/headers";
import superjson from "superjson";

import { auth } from "@/lib/auth";

export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return { session };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Authenticated procedure — validates session exists
export const authProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      userId: ctx.session.user.id,
      user: ctx.session.user,
    },
  });
});

// Admin procedure — validates session + requires admin role
export const adminProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const role = (ctx.session.user as Record<string, unknown>).role as
    | string
    | undefined;

  if (role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({
    ctx: {
      userId: ctx.session.user.id,
      user: ctx.session.user,
    },
  });
});

// Organization procedure — validates session + extracts orgId
export const orgProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const orgId = (ctx.session.user as Record<string, unknown>).orgId as
    | string
    | undefined;

  if (!orgId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No organization found for user",
    });
  }

  return next({
    ctx: {
      userId: ctx.session.user.id,
      orgId,
      user: ctx.session.user,
    },
  });
});
