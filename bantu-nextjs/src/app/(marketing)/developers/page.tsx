import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/features/docs/components/code-block";
import { DocsNote } from "@/features/docs/components/docs-note";

export default function DevelopersIntroductionPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          TaurAI API Documentation
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          The TaurAI REST API lets you generate high-quality speech audio from
          text, transcribe audio to text, list available voices, and manage your
          history — all from a simple HTTP interface.
        </p>
      </div>

      <Separator />

      {/* Base URL */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Base URL</h2>
        <p className="text-sm text-muted-foreground">
          All API endpoints are relative to your deployment origin:
        </p>
        <CodeBlock
          code="https://your-domain.com/api/v1"
          language="text"
        />
      </section>

      <Separator />

      {/* Quick Start */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Quick Start</h2>
        <p className="text-sm text-muted-foreground">
          Get started in three steps: create an API key, list voices, then
          generate speech.
        </p>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              1. Create an API Key
            </h3>
            <p className="text-sm text-muted-foreground">
              <Link
                href="/sign-up"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign up for a TaurAI account
              </Link>
              , then navigate to Settings &rarr; Developer &rarr; API Keys to
              create a new key. Copy it immediately — it is only shown once.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              2. List Available Voices
            </h3>
            <CodeBlock
              code={`curl -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  https://your-domain.com/api/v1/voices`}
              language="bash"
            />
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              3. Generate Speech
            </h3>
            <CodeBlock
              code={`curl -X POST \\
  -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello from TaurAI!",
    "voiceId": "VOICE_ID_FROM_STEP_2"
  }' \\
  https://your-domain.com/api/v1/speech`}
              language="bash"
            />
          </div>
        </div>

        <DocsNote variant="tip">
          The response includes an <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">audioUrl</code> field.
          Append <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">?format=mp3</code> to
          download the audio as MP3 instead of WAV.
        </DocsNote>
      </section>

      <Separator />

      {/* Sections overview */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">What&apos;s in the Docs</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: "Authentication",
              description: "API key format, Bearer tokens, and security best practices.",
              href: "/developers/authentication",
            },
            {
              title: "Text to Speech",
              description: "Generate speech audio from text with customizable voice parameters.",
              href: "/developers/text-to-speech",
            },
            {
              title: "Speech to Text",
              description: "Transcribe audio files to text with timestamps and language detection.",
              href: "/developers/speech-to-text",
            },
            {
              title: "Voices",
              description: "List and search system and custom voices.",
              href: "/developers/voices",
            },
            {
              title: "Generations",
              description: "Retrieve your generation history with pagination.",
              href: "/developers/generations",
            },
            {
              title: "Webhooks",
              description: "Receive real-time notifications when events occur.",
              href: "/developers/webhooks",
            },
          ].map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col rounded-lg border p-4 transition-colors hover:bg-accent/50"
            >
              <span className="text-sm font-semibold group-hover:underline">
                {section.title}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {section.description}
              </span>
              <ArrowRight className="mt-3 size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
