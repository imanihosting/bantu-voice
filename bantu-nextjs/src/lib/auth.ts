import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, twoFactor } from "better-auth/plugins";

import { prisma } from "./db";
import { env } from "./env";
import { sendMail } from "./email";
import {
  welcomeEmail,
  emailVerificationEmail,
  passwordResetEmail,
} from "./email-templates";

export const auth = betterAuth({
  appName: "TaurAI",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.APP_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const template = passwordResetEmail({
        name: user.name || "there",
        resetUrl: url,
      });
      await sendMail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const template = emailVerificationEmail({
        name: user.name || "there",
        verificationUrl: url,
      });
      await sendMail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    },
    sendOnSignUp: true,
  },
  plugins: [admin(), twoFactor()],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min cookie cache
    },
  },
  user: {
    additionalFields: {
      orgId: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      street: {
        type: "string",
        required: false,
      },
      city: {
        type: "string",
        required: false,
      },
      state: {
        type: "string",
        required: false,
      },
      postalCode: {
        type: "string",
        required: false,
      },
      country: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Send welcome email to new users
          try {
            const template = welcomeEmail({
              name: user.name || "there",
              loginUrl: `${env.APP_URL}/dashboard`,
            });
            await sendMail({
              to: user.email,
              subject: template.subject,
              html: template.html,
            });
          } catch (err) {
            console.error("[auth] Failed to send welcome email:", err);
          }

          // Migrate existing local-org data to the first registered user
          const orgId = user.orgId;
          if (!orgId) return;

          const localOrgData = await prisma.voice.findFirst({
            where: { orgId: "local-org" },
            select: { id: true },
          });

          if (!localOrgData) return;

          // Migrate all 6 tables from local-org to new user's orgId
          await prisma.$transaction([
            prisma.voice.updateMany({
              where: { orgId: "local-org" },
              data: { orgId },
            }),
            prisma.generation.updateMany({
              where: { orgId: "local-org" },
              data: { orgId },
            }),
            prisma.apiKey.updateMany({
              where: { orgId: "local-org" },
              data: { orgId },
            }),
            prisma.webhook.updateMany({
              where: { orgId: "local-org" },
              data: { orgId },
            }),
            prisma.transcription.updateMany({
              where: { orgId: "local-org" },
              data: { orgId },
            }),
            prisma.apiRequestLog.updateMany({
              where: { orgId: "local-org" },
              data: { orgId },
            }),
          ]);
        },
      },
    },
  },
});
