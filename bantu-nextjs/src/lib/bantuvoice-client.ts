import createClient from "openapi-fetch";
import type { paths } from "@/types/bantuvoice-api";
import { env } from "./env";

export const bantuvoice = createClient<paths>({
  baseUrl: env.BANTUVOICE_API_URL,
  headers: {
    "x-api-key": env.BANTUVOICE_API_KEY,
  },
});
