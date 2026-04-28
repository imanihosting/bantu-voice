"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";

const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text"),
  voiceId: z.string().min(1, "Please select a voice"),
  numStep: z.number().int().min(4).max(64),
  guidanceScale: z.number().min(0).max(4),
  speed: z.number().min(0.25).max(2),
  // 0 means "auto" — server treats 0/null the same.
  duration: z.number().min(0).max(60),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  numStep: 32,
  guidanceScale: 2.0,
  speed: 1.0,
  duration: 0,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const data = await createMutation.mutateAsync({
          text: value.text.trim(),
          voiceId: value.voiceId,
          numStep: value.numStep,
          guidanceScale: value.guidanceScale,
          speed: value.speed,
          duration: value.duration > 0 ? value.duration : undefined,
        });

        toast.success("Audio generated successfully!");
        router.push(`/text-to-speech/${data.id}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";
        toast.error(message);
      }
    },
  });

  return <form.AppForm>{children}</form.AppForm>;
};
