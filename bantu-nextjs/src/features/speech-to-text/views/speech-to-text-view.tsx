"use client";

import { useState, useCallback, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { UploadZone } from "@/features/speech-to-text/components/upload-zone";
import { RecordAudioPanel } from "@/features/speech-to-text/components/record-audio-panel";
import { LanguageSelector } from "@/features/speech-to-text/components/language-selector";
import { TranscriptionResult } from "@/features/speech-to-text/components/transcription-result";
import { TranscriptionHistory } from "@/features/speech-to-text/components/transcription-history";

interface TranscribeResult {
  id: string;
  text: string;
  language: string;
  durationSeconds: number;
  segments: { start: number; end: number; text: string }[];
}

export function SpeechToTextView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [language, setLanguage] = useState("auto");
  const [result, setResult] = useState<TranscribeResult | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const transcribeMutation = useMutation(
    trpc.transcriptions.create.mutationOptions({
      onSuccess: (data) => {
        setResult(data);
        queryClient.invalidateQueries({
          queryKey: trpc.transcriptions.getAll.queryKey(),
        });
      },
    }),
  );

  const handleTranscribe = useCallback(async () => {
    const audioSource = activeTab === "upload" ? file : recordedBlob;
    if (!audioSource) return;

    const arrayBuffer = await audioSource.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    transcribeMutation.mutate({
      audioBase64: base64,
      language: language === "auto" ? undefined : language.split("-")[0],
      fileName:
        audioSource instanceof File ? audioSource.name : "recording.wav",
    });
  }, [activeTab, file, recordedBlob, language, transcribeMutation]);

  const handleRecorded = useCallback((blob: Blob) => {
    setRecordedBlob(blob);
    setResult(null);
  }, []);

  const hasAudio =
    (activeTab === "upload" && file !== null) ||
    (activeTab === "record" && recordedBlob !== null);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Input section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Audio Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v);
                setResult(null);
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="record">Record Audio</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-4">
                <UploadZone
                  file={file}
                  onFileChange={(f) => {
                    setFile(f);
                    setResult(null);
                  }}
                  disabled={transcribeMutation.isPending}
                />
              </TabsContent>
              <TabsContent value="record" className="mt-4">
                <RecordAudioPanel
                  onRecorded={handleRecorded}
                  disabled={transcribeMutation.isPending}
                />
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium">Language</label>
                <LanguageSelector
                  value={language}
                  onValueChange={setLanguage}
                  disabled={transcribeMutation.isPending}
                />
              </div>
              <Button
                onClick={handleTranscribe}
                disabled={!hasAudio || transcribeMutation.isPending}
                className="shrink-0"
              >
                {transcribeMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Transcribe
              </Button>
            </div>

            {transcribeMutation.isError && (
              <p className="text-sm text-destructive">
                {transcribeMutation.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Result section */}
        {result && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <TranscriptionResult
                text={result.text}
                language={result.language}
                durationSeconds={result.durationSeconds}
                segments={result.segments}
                expanded
              />
            </CardContent>
          </Card>
        )}

        {/* History section */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <TranscriptionHistory />
        </Suspense>
      </div>
    </div>
  );
}
