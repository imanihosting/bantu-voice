"use client";

import { useState } from "react";
import {
  Loader2,
  Trash2,
  Plus,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";

const SPEAKER_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-purple-100 text-purple-700 border-purple-200",
] as const;

const MAX_SPEAKERS = 4;
const MAX_LINES = 100;

type ScriptLine = {
  speaker: number;
  text: string;
};

export function MultiSpeakerTTSView() {
  const trpc = useTRPC();
  const router = useRouter();
  const { data: voices } = useSuspenseQuery(trpc.voices.getAll.queryOptions());

  const { custom: customVoices, system: systemVoices } = voices;
  const allVoices = [...customVoices, ...systemVoices];

  // Track how many speakers are active (start with 2)
  const [speakerCount, setSpeakerCount] = useState(2);

  // Voice ID per speaker (1-indexed keys as strings)
  const [voiceIds, setVoiceIds] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (let i = 1; i <= MAX_SPEAKERS; i++) {
      initial[String(i)] = allVoices[Math.min(i - 1, allVoices.length - 1)]?.id ?? "";
    }
    return initial;
  });

  // Script lines
  const [lines, setLines] = useState<ScriptLine[]>([
    { speaker: 1, text: "" },
    { speaker: 2, text: "" },
  ]);

  const multiSpeakerMutation = useMutation(
    trpc.generations.createMultiSpeaker.mutationOptions({}),
  );

  const isGenerating = multiSpeakerMutation.isPending;
  const nonEmptyLines = lines.filter((l) => l.text.trim().length > 0);
  const totalChars = nonEmptyLines.reduce((sum, l) => sum + l.text.trim().length, 0);

  const updateVoiceId = (speaker: string, voiceId: string) => {
    setVoiceIds((prev) => ({ ...prev, [speaker]: voiceId }));
  };

  const addLine = () => {
    if (lines.length < MAX_LINES) {
      // Default to the next speaker in rotation
      const lastSpeaker = lines[lines.length - 1]?.speaker ?? 0;
      const nextSpeaker = (lastSpeaker % speakerCount) + 1;
      setLines([...lines, { speaker: nextSpeaker, text: "" }]);
    }
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLineText = (index: number, text: string) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], text };
    setLines(updated);
  };

  const updateLineSpeaker = (index: number, speaker: number) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], speaker };
    setLines(updated);
  };

  const addSpeaker = () => {
    if (speakerCount < MAX_SPEAKERS) {
      setSpeakerCount((c) => c + 1);
    }
  };

  const removeSpeaker = () => {
    if (speakerCount > 2) {
      const newCount = speakerCount - 1;
      // Reassign any lines from the removed speaker to speaker 1
      setLines((prev) =>
        prev.map((l) =>
          l.speaker > newCount ? { ...l, speaker: 1 } : l
        )
      );
      setSpeakerCount(newCount);
    }
  };

  const handleGenerate = async () => {
    if (nonEmptyLines.length === 0) return;

    // Validate all active speakers have a voice selected
    const usedSpeakers = [...new Set(nonEmptyLines.map((l) => l.speaker))];
    const missingVoice = usedSpeakers.find((s) => !voiceIds[String(s)]);
    if (missingVoice) {
      toast.error(`Please select a voice for Speaker ${missingVoice}`);
      return;
    }

    // Build voiceIds map for only used speakers
    const activeVoiceIds: Record<string, string> = {};
    for (const spk of usedSpeakers) {
      activeVoiceIds[String(spk)] = voiceIds[String(spk)];
    }

    try {
      const data = await multiSpeakerMutation.mutateAsync({
        script: nonEmptyLines.map((l) => ({
          speaker: l.speaker,
          text: l.text.trim(),
        })),
        voiceIds: activeVoiceIds,
        cfgWeight: 0.5,
      });

      toast.success("Multi-speaker audio generated!");
      router.push(`/text-to-speech/${data.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate audio";
      toast.error(message);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Multi-speaker</h2>
              <p className="text-sm text-muted-foreground">
                Create dialogue with up to {MAX_SPEAKERS} different voices.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/text-to-speech">
                <FileText className="size-4" />
                Single mode
              </Link>
            </Button>
          </div>

          {/* Speaker Voices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Speakers ({speakerCount})
              </label>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={removeSpeaker}
                  disabled={speakerCount <= 2 || isGenerating}
                >
                  Remove
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={addSpeaker}
                  disabled={speakerCount >= MAX_SPEAKERS || isGenerating}
                >
                  <Plus className="size-3" />
                  Add speaker
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: speakerCount }, (_, i) => i + 1).map(
                (spk) => {
                  const selectedVoice = allVoices.find(
                    (v) => v.id === voiceIds[String(spk)]
                  );
                  return (
                    <div key={spk} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${SPEAKER_COLORS[spk - 1]}`}
                        >
                          Speaker {spk}
                        </Badge>
                      </div>
                      <Select
                        value={voiceIds[String(spk)] ?? ""}
                        onValueChange={(v) => updateVoiceId(String(spk), v)}
                        disabled={isGenerating}
                      >
                        <SelectTrigger className="h-auto w-full gap-1 rounded-lg bg-white px-2 py-1">
                          <SelectValue>
                            {selectedVoice && (
                              <>
                                <VoiceAvatar
                                  seed={selectedVoice.id}
                                  name={selectedVoice.name}
                                />
                                <span className="truncate text-sm font-medium tracking-tight">
                                  {selectedVoice.name}
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
                                    {v.name} -{" "}
                                    {VOICE_CATEGORY_LABELS[v.category]}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {customVoices.length > 0 &&
                            systemVoices.length > 0 && <SelectSeparator />}
                          {systemVoices.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Built-in Voices</SelectLabel>
                              {systemVoices.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  <VoiceAvatar seed={v.id} name={v.name} />
                                  <span className="truncate text-sm font-medium">
                                    {v.name} -{" "}
                                    {VOICE_CATEGORY_LABELS[v.category]}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Script Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Script ({nonEmptyLines.length} line
                {nonEmptyLines.length !== 1 ? "s" : ""})
              </label>
            </div>

            {lines.map((line, index) => (
              <div key={index} className="group flex items-start gap-2">
                {/* Speaker selector */}
                <Select
                  value={String(line.speaker)}
                  onValueChange={(v) => updateLineSpeaker(index, Number(v))}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    className={`mt-0.5 h-8 w-24 shrink-0 text-xs font-medium ${SPEAKER_COLORS[line.speaker - 1]}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: speakerCount }, (_, i) => i + 1).map(
                      (spk) => (
                        <SelectItem key={spk} value={String(spk)}>
                          <Badge
                            variant="outline"
                            className={`text-xs ${SPEAKER_COLORS[spk - 1]}`}
                          >
                            Speaker {spk}
                          </Badge>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                {/* Text input */}
                <Textarea
                  value={line.text}
                  onChange={(e) => updateLineText(index, e.target.value)}
                  placeholder={`Speaker ${line.speaker} says...`}
                  className="min-h-10 flex-1 resize-none text-sm"
                  maxLength={TEXT_MAX_LENGTH}
                  disabled={isGenerating}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeLine(index)}
                  disabled={lines.length <= 1 || isGenerating}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addLine}
              disabled={lines.length >= MAX_LINES || isGenerating}
            >
              <Plus className="size-4" />
              Add line ({lines.length}/{MAX_LINES})
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5 border-dashed">
                <Users className="size-3" />
                <span className="text-xs">
                  {speakerCount} speaker{speakerCount !== 1 ? "s" : ""}
                </span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-dashed">
                <span className="text-xs">
                  {nonEmptyLines.length} line
                  {nonEmptyLines.length !== 1 ? "s" : ""}
                </span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-dashed">
                <span className="text-xs tabular-nums">
                  {totalChars.toLocaleString()} chars
                </span>
              </Badge>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || nonEmptyLines.length === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Users className="size-4" />
                  Generate dialogue
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
