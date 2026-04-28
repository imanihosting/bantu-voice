import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/features/docs/components/code-block";
import { DocsNote } from "@/features/docs/components/docs-note";

export default function AuthenticationPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Authentication</h1>
        <p className="text-muted-foreground leading-relaxed">
          All API requests must be authenticated using a Bearer token in the
          Authorization header.
        </p>
      </div>

      <Separator />

      {/* API Key format */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">API Key Format</h2>
        <p className="text-sm text-muted-foreground">
          API keys use the <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">tk_</code> prefix
          followed by 48 hexadecimal characters. Example:
        </p>
        <CodeBlock code="tk_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6" language="text" />
        <p className="text-sm text-muted-foreground">
          Keys are hashed with SHA-256 before storage. The plaintext key is only
          shown once at creation time — copy it immediately.
        </p>
      </section>

      <Separator />

      {/* Creating keys */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Creating an API Key</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            Navigate to{" "}
            <Link
              href="/settings"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Settings &rarr; Developer &rarr; API Keys
            </Link>
          </li>
          <li>
            Click <strong className="text-foreground">Create API key</strong> and
            give it a descriptive name.
          </li>
          <li>
            Copy the key from the dialog. It will not be shown again.
          </li>
        </ol>
      </section>

      <Separator />

      {/* Using the key */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Using the Key</h2>
        <p className="text-sm text-muted-foreground">
          Include your API key in the <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">Authorization</code> header
          as a Bearer token:
        </p>
        <CodeBlock
          code={`curl -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  https://your-domain.com/api/v1/voices`}
          language="bash"
        />
      </section>

      <Separator />

      {/* Error responses */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Error Responses</h2>
        <p className="text-sm text-muted-foreground">
          If the key is missing, invalid, or revoked, the API returns a{" "}
          <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">401</code> response:
        </p>
        <CodeBlock
          code={`{
  "error": {
    "message": "Invalid or missing API key"
  }
}`}
          language="json"
        />
      </section>

      <Separator />

      {/* Security */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Security Best Practices</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Never expose keys in client-side code.</strong>{" "}
            Always call the API from your backend server.
          </li>
          <li>
            <strong className="text-foreground">Use environment variables</strong> to store keys
            instead of hardcoding them.
          </li>
          <li>
            <strong className="text-foreground">Rotate keys regularly.</strong> If you suspect a
            key has been compromised, revoke it immediately in Settings and
            create a new one.
          </li>
          <li>
            <strong className="text-foreground">Use separate keys</strong> for development and
            production environments.
          </li>
        </ul>

        <DocsNote variant="warning">
          Treat your API key like a password. Anyone with access to your key can
          make requests and consume your usage quota.
        </DocsNote>
      </section>
    </>
  );
}
