"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border bg-muted">
      <div className="flex items-center justify-between border-b px-4 py-2">
        {language && (
          <span className="text-xs font-medium text-muted-foreground">
            {language}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-7"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-sm leading-relaxed font-mono whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}
