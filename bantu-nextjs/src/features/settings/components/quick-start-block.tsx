"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

const EXAMPLES = [
  {
    label: "List voices",
    command: (origin: string) =>
      `curl -H "Authorization: Bearer tk_..." ${origin}/api/v1/voices`,
  },
  {
    label: "Generate speech",
    command: (origin: string) =>
      `curl -X POST -H "Authorization: Bearer tk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Hello world","voiceId":"..."}' \\
  ${origin}/api/v1/speech`,
  },
  {
    label: "List generations",
    command: (origin: string) =>
      `curl -H "Authorization: Bearer tk_..." ${origin}/api/v1/generations`,
  },
];

export function QuickStartBlock() {
  const [copied, setCopied] = useState(false);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const allCommands = EXAMPLES.map((e) => `# ${e.label}\n${e.command(origin)}`)
    .join("\n\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(allCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Quick start</p>
        <Button variant="ghost" size="icon" className="size-7" onClick={handleCopy}>
          {copied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
      <div className="rounded-lg bg-muted p-4 overflow-x-auto">
        <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre">
          {allCommands}
        </pre>
      </div>
    </div>
  );
}
