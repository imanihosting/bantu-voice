import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    APP_URL: z.string().min(1),
    S3_ENDPOINT: z.string().url(),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1),
    S3_REGION: z.string().optional(),
    BANTUVOICE_API_URL: z.url(),
    BANTUVOICE_API_KEY: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    MS_GRAPH_TENANT_ID: z.string().min(1),
    MS_GRAPH_CLIENT_ID: z.string().min(1),
    MS_GRAPH_CLIENT_SECRET: z.string().min(1),
    MS_GRAPH_SENDER_EMAIL: z.string().email(),
  },
  experimental__runtimeEnv: {},
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
