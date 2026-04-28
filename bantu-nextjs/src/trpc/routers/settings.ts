import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { createTRPCRouter, baseProcedure, authProcedure } from "../init";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { passwordChangedEmail } from "@/lib/email-templates";

interface ServiceStatus {
  name: string;
  status: "connected" | "disconnected";
  latency: number;
  details?: string;
}

async function checkBantuvoice(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const res = await fetch(`${env.BANTUVOICE_API_URL}/healthz`, {
      headers: { "x-api-key": env.BANTUVOICE_API_KEY },
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;

    if (!res.ok) {
      return { name: "TTS Engine", status: "disconnected", latency, details: `HTTP ${res.status}` };
    }

    const body = await res.json() as Record<string, unknown>;
    const isOk = body.status === "ok" && body.model_loaded === true;

    return {
      name: "TTS Engine",
      status: isOk ? "connected" : "disconnected",
      latency,
      details: isOk ? "BantuVoice ready" : "Model not loaded",
    };
  } catch {
    return { name: "TTS Engine", status: "disconnected", latency: Date.now() - start, details: "Unreachable" };
  }
}

async function checkStorage(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const s3 = new S3Client({
      region: env.S3_REGION ?? "us-east-1",
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });

    await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET_NAME }));
    const latency = Date.now() - start;

    return { name: "Storage (MinIO)", status: "connected", latency, details: `Bucket: ${env.S3_BUCKET_NAME}` };
  } catch {
    return { name: "Storage (MinIO)", status: "disconnected", latency: Date.now() - start, details: "Unreachable" };
  }
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    const latency = Date.now() - start;

    return { name: "Database", status: "connected", latency, details: "PostgreSQL" };
  } catch {
    return { name: "Database", status: "disconnected", latency: Date.now() - start, details: "Unreachable" };
  }
}

export const settingsRouter = createTRPCRouter({
  getHealth: baseProcedure.query(async () => {
    const [bantuvoice, storage, database] = await Promise.all([
      checkBantuvoice(),
      checkStorage(),
      checkDatabase(),
    ]);

    return { services: [bantuvoice, storage, database] };
  }),

  notifyPasswordChanged: authProcedure.mutation(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { name: true, email: true },
    });

    if (!user) return { success: false };

    try {
      const template = passwordChangedEmail({
        name: user.name || "there",
        changedAt: new Date().toUTCString(),
      });
      await sendMail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (err) {
      console.error("[settings] Failed to send password changed email:", err);
    }

    return { success: true };
  }),
});
