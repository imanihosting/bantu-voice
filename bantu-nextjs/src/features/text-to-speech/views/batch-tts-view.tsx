"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Plus,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";
import {
  TEXT_MAX_LENGTH,
  BATCH_MAX_PARAGRAPHS,
  COST_PER_UNIT,
} from "@/features/text-to-speech/data/constants";

type BatchResult = {
  index: number;
  id: string;
  error?: string;
};

export function BatchTTSView() {
  const trpc = useTRPC();
  const { data: voices } = useSuspenseQuery(trpc.voices.getAll.queryOptions());

  const { custom: customVoices, system: systemVoices } = voices;
  const allVoices = [...customVoices, ...systemVoices];

  const [voiceId, setVoiceId] = useState(allVoices[0]?.id ?? "");
  const [paragraphs, setParagraphs] = useState<string[]>([""]);
  const [results, setResults] = useState<BatchResult[]>([]);

  const batchMutation = useMutation(
    trpc.generations.createBatch.mutationOptions({}),
  );

  const nonEmptyParagraphs = paragraphs.filter((p) => p.trim().length > 0);
  const totalChars = nonEmptyParagraphs.reduce((sum, p) => sum + p.trim().length, 0);
  const isGenerating = batchMutation.isPending;

  const addParagraph = () => {
    if (paragraphs.length < BATCH_MAX_PARAGRAPHS) {
      setParagraphs([...paragraphs, ""]);
    }
  };

  const removeParagraph = (index: number) => {
    if (paragraphs.length > 1) {
      setParagraphs(paragraphs.filter((_, i) => i !== index));
    }
  };

  const updateParagraph = (index: number, value: string) => {
    const updated = [...paragraphs];
    updated[index] = value;
    setParagraphs(updated);
  };

  const handleSplitPaste = () => {
    const firstParagraph = paragraphs[0] ?? "";
    if (!firstParagraph.includes("\n\n")) return;

    const parts = firstParagraph
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, BATCH_MAX_PARAGRAPHS);

    setParagraphs(parts);
  };

  const handleGenerate = async () => {
    if (nonEmptyParagraphs.length === 0 || !voiceId) return;

    setResults([]);

    try {
      const data = await batchMutation.mutateAsync({
        paragraphs: nonEmptyParagraphs,
        voiceId,
        numStep: 32,
        guidanceScale: 2.0,
        speed: 1.0,
      });

      setResults(data.results);

      const succeeded = data.results.filter((r) => !r.error).length;
      const failed = data.results.filter((r) => r.error).length;

      if (failed === 0) {
        toast.success(`All ${succeeded} audio files generated successfully!`);
      } else {
        toast.warning(`${succeeded} succeeded, ${failed} failed`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Batch generation failed";
      toast.error(message);
    }
  };

  const selectedVoice = allVoices.find((v) => v.id === voiceId);
  const progress = results.length > 0
    ? Math.round((results.length / nonEmptyParagraphs.length) * 100)
    : 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Batch generation</h2>
              <p className="text-sm text-muted-foreground">
                Generate audio for multiple paragraphs at once.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/text-to-speech">
                  <FileText className="size-4" />
                  Single mode
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/text-to-speech/multi-speaker">
                  <Users className="size-4" />
                  Multi-speaker
                </Link>
              </Button>
            </div>
          </div>

          {/* Voice selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Voice</label>
            <Select
              value={voiceId}
              onValueChange={setVoiceId}
              disabled={isGenerating}
            >
              <SelectTrigger className="w-full h-auto gap-1 rounded-lg bg-white px-2 py-1">
                <SelectValue>
                  {selectedVoice && (
                    <>
                      <VoiceAvatar
                        seed={selectedVoice.id}
                        name={selectedVoice.name}
                      />
                      <span className="truncate text-sm font-medium tracking-tight">
                        {selectedVoice.name}
                        {selectedVoice.category &&
                          ` - ${VOICE_CATEGORY_LABELS[selectedVoice.category]}`}
                      </span>
                    </>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {customVoices.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Team Voices</SelectLabel>
                    {customVoices.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <VoiceAvatar seed={v.id} name={v.name} />
                        <span className="truncate text-sm font-medium">
                          {v.name} - {VOICE_CATEGORY_LABELS[v.category]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {customVoices.length > 0 && systemVoices.length > 0 && (
                  <SelectSeparator />
                )}
                {systemVoices.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Built-in Voices</SelectLabel>
                    {systemVoices.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <VoiceAvatar seed={v.id} name={v.name} />
                        <span className="truncate text-sm font-medium">
                          {v.name} - {VOICE_CATEGORY_LABELS[v.category]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Paragraphs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Paragraphs ({nonEmptyParagraphs.length})
              </label>
              {paragraphs.length === 1 && paragraphs[0].includes("\n\n") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={handleSplitPaste}
                >
                  Split by blank lines
                </Button>
              )}
            </div>

            {paragraphs.map((text, index) => {
              const result = results.find((r) => r.index === index);
              return (
                <div key={index} className="group relative">
                  <div className="flex items-start gap-2">
                    <span className="mt-2.5 text-xs font-medium text-muted-foreground tabular-nums w-5 text-right shrink-0">
                      {index + 1}
                    </span>
                    <div className="relative flex-1">
                      <Textarea
                        value={text}
                        onChange={(e) => updateParagraph(index, e.target.value)}
                        placeholder={`Paragraph ${index + 1}...`}
                        className="min-h-20 resize-none text-sm"
                        maxLength={TEXT_MAX_LENGTH}
                        disabled={isGenerating}
                      />
                      {result && (
                        <div className="absolute right-2 top-2">
                          {result.error ? (
                            <Badge variant="destructive" className="gap-1 text-xs">
                              <XCircle className="size-3" />
                              Failed
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="gap-1 border-green-200 bg-green-50 text-xs text-green-700"
                            >
                              <CheckCircle2 className="size-3" />
                              <Link
                                href={`/text-to-speech/${result.id}`}
                                className="hover:underline"
                              >
                                Done
                              </Link>
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      onClick={() => removeParagraph(index)}
                      disabled={paragraphs.length <= 1 || isGenerating}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addParagraph}
              disabled={
                paragraphs.length >= BATCH_MAX_PARAGRAPHS || isGenerating
              }
            >
              <Plus className="size-4" />
              Add paragraph ({paragraphs.length}/{BATCH_MAX_PARAGRAPHS})
            </Button>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5 border-dashed">
                <span className="text-xs">
                  {nonEmptyParagraphs.length} paragraph
                  {nonEmptyParagraphs.length !== 1 ? "s" : ""}
                </span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-dashed">
                <span className="text-xs tabular-nums">
                  ${(totalChars * COST_PER_UNIT).toFixed(4)} estimated
                </span>
              </Badge>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                nonEmptyParagraphs.length === 0 ||
                !voiceId
              }
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate ${nonEmptyParagraphs.length} audio${nonEmptyParagraphs.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-xs text-muted-foreground">
                Generating audio... This may take a while.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
