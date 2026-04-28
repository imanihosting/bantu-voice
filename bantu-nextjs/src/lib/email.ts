import "server-only";

import { env } from "./env";

// ---------------------------------------------------------------------------
// Microsoft Graph OAuth2 token cache
// ---------------------------------------------------------------------------

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${env.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: env.MS_GRAPH_CLIENT_ID,
    client_secret: env.MS_GRAPH_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[email] Failed to acquire Graph token:", text);
    throw new Error(`Graph token request failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  // Cache with 5-minute safety margin
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return tokenCache.accessToken;
}

// ---------------------------------------------------------------------------
// Send mail via Microsoft Graph
// ---------------------------------------------------------------------------

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  const token = await getAccessToken();

  const senderEmail = env.MS_GRAPH_SENDER_EMAIL;
  const url = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`;

  const message = {
    message: {
      subject: options.subject,
      body: {
        contentType: "HTML",
        content: options.html,
      },
      toRecipients: [
        {
          emailAddress: {
            address: options.to,
          },
        },
      ],
      ...(options.replyTo && {
        replyTo: [
          {
            emailAddress: {
              address: options.replyTo,
            },
          },
        ],
      }),
    },
    saveToSentItems: false,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[email] Graph sendMail failed:", res.status, text);
    throw new Error(`sendMail failed: ${res.status}`);
  }

  console.log(`[email] Sent "${options.subject}" to ${options.to}`);
}
