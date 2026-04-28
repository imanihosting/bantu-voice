import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/features/docs/components/code-block";
import { DocsNote } from "@/features/docs/components/docs-note";

export default function DevelopersWebhooksPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground leading-relaxed">
          Webhooks let you receive real-time HTTP notifications when events occur
          in your TaurAI account, such as when a speech generation completes or
          fails.
        </p>
      </div>

      <Separator />

      {/* Events */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Available Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 text-left font-semibold">Event</th>
                <th className="py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">
                  <code className="text-xs font-mono">generation.completed</code>
                </td>
                <td className="py-2">
                  Fired when a speech generation finishes successfully.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">
                  <code className="text-xs font-mono">generation.failed</code>
                </td>
                <td className="py-2">
                  Fired when a speech generation fails.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Setup */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Setting Up Webhooks</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/sign-up"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign up for a TaurAI account
            </Link>{" "}
            and navigate to Settings &rarr; Developer &rarr; Webhooks.
          </li>
          <li>
            Click <strong className="text-foreground">Add webhook</strong> and
            enter your endpoint URL.
          </li>
          <li>Select the events you want to subscribe to.</li>
          <li>
            Copy the signing secret from the confirmation dialog. It starts with{" "}
            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
              whsec_
            </code>{" "}
            and is only shown once.
          </li>
        </ol>
      </section>

      <Separator />

      {/* Payload format */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Payload Format</h2>
        <p className="text-sm text-muted-foreground">
          TaurAI sends a POST request to your endpoint URL with a JSON body:
        </p>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">generation.completed</h3>
          <CodeBlock
            code={`{
  "event": "generation.completed",
  "timestamp": "2025-06-15T10:30:05.000Z",
  "data": {
    "id": "clx2xyz789ghi012",
    "text": "Hello from TaurAI!",
    "voiceName": "Aria",
    "audioUrl": "/api/audio/clx2xyz789ghi012"
  }
}`}
            language="json"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">generation.failed</h3>
          <CodeBlock
            code={`{
  "event": "generation.failed",
  "timestamp": "2025-06-15T10:30:05.000Z",
  "data": {
    "id": "clx2xyz789ghi012",
    "text": "Hello from TaurAI!",
    "voiceName": "Aria",
    "error": "Failed to generate audio"
  }
}`}
            language="json"
          />
        </div>
      </section>

      <Separator />

      {/* Verifying signatures */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Verifying Webhook Signatures</h2>
        <p className="text-sm text-muted-foreground">
          To verify that a webhook was sent by TaurAI and not a third party, you
          should validate the request signature using HMAC-SHA256 with your
          signing secret.
        </p>

        <CodeBlock
          code={`import crypto from "crypto";

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your webhook handler:
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-taurai-signature"];
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    "whsec_YOUR_SIGNING_SECRET"
  );

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  // Process the event
  const { event, data } = req.body;
  console.log("Received event:", event, data);

  res.status(200).send("OK");
});`}
          language="javascript"
        />

        <DocsNote variant="warning">
          Always verify the signature before processing webhook events. This
          prevents attackers from sending fake events to your endpoint.
        </DocsNote>
      </section>

      <Separator />

      {/* Testing */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Testing Webhooks</h2>
        <p className="text-sm text-muted-foreground">
          You can send a test event to your webhook endpoint from the dashboard.{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>{" "}
          and navigate to Settings &rarr; Developer &rarr; Webhooks, click the
          three-dot menu on a webhook row and select{" "}
          <strong className="text-foreground">Send test</strong>. The test
          payload looks like:
        </p>
        <CodeBlock
          code={`{
  "event": "test",
  "timestamp": "2025-06-15T10:30:00.000Z",
  "data": {
    "message": "This is a test webhook from TaurAI."
  }
}`}
          language="json"
        />
      </section>

      <Separator />

      {/* Best practices */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Best Practices</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Respond quickly.</strong> Return
            a 200 status within 10 seconds. Process events asynchronously if
            needed.
          </li>
          <li>
            <strong className="text-foreground">Handle duplicates.</strong> Use
            the generation ID to deduplicate events in case they are delivered
            more than once.
          </li>
          <li>
            <strong className="text-foreground">Use HTTPS.</strong> Always use an
            HTTPS endpoint to protect the webhook payload in transit.
          </li>
          <li>
            <strong className="text-foreground">
              Store the signing secret securely.
            </strong>{" "}
            Use environment variables — never hardcode it in your source code.
          </li>
          <li>
            <strong className="text-foreground">Monitor failures.</strong> If
            your endpoint returns a non-2xx status, check your server logs. You
            can disable and re-enable the webhook to reset its state.
          </li>
        </ul>
      </section>
    </>
  );
}
