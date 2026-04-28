"use client";

import { useStore } from "@tanstack/react-form";
import { Globe } from "lucide-react";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
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
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { sliders } from "@/features/text-to-speech/data/sliders";
import { ttsFormOptions } from "@/features/text-to-speech/components/text-to-speech-form";
import { VoiceSelector } from "@/features/text-to-speech/components/voice-selector";
import {
  SUPPORTED_LANGUAGES,
  REGION_LABELS,
  type LanguageRegion,
} from "@/features/voices/data/supported-languages";

const REGION_ORDER: LanguageRegion[] = [
  "southern-africa",
  "east-africa",
  "west-africa",
  "common",
];

const AUTO_VALUE = "__auto__";

export function SettingsPanelSettings() {
  const form = useTypedAppFormContext(ttsFormOptions);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <>
      {/* Voice Style Dropdown Section */}
      <div className="border-b border-dashed p-4">
        <VoiceSelector />
      </div>

      {/* Language Override Section */}
      <div className="border-b border-dashed p-4">
        <form.Field name="language">
          {(field) => (
            <Field>
              <FieldLabel>Language</FieldLabel>
              <Select
                value={field.state.value || AUTO_VALUE}
                onValueChange={(v) =>
                  field.handleChange(v === AUTO_VALUE ? "" : v)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="size-4 shrink-0 text-muted-foreground" />
                    <SelectValue placeholder="Auto (use voice's language)" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUTO_VALUE}>
                    Auto (use voice&apos;s language)
                  </SelectItem>
                  {REGION_ORDER.map((region) => {
                    const langs = SUPPORTED_LANGUAGES.filter(
                      (l) => l.region === region,
                    );
                    if (!langs.length) return null;
                    return (
                      <SelectGroup key={region}>
                        <SelectSeparator />
                        <SelectLabel>{REGION_LABELS[region]}</SelectLabel>
                        {langs.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Override the language for this generation. Useful when a voice
                speaks a different language than its profile.
              </p>
            </Field>
          )}
        </form.Field>
      </div>

      {/* Voice Adjustments Section */}
      <div className="p-4 flex-1">
        <FieldGroup className="gap-8">
          {sliders.map((slider) => (
            <form.Field key={slider.id} name={slider.id}>
              {(field) => (
                <Field>
                  <FieldLabel>{slider.label}</FieldLabel>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {slider.leftLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {slider.rightLabel}
                    </span>
                  </div>
                  <Slider
                    value={[field.state.value]}
                    onValueChange={(value) => field.handleChange(value[0])}
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    disabled={isSubmitting}
                    className="**:data-[slot=slider-thumb]:size-3 **:data-[slot=slider-thumb]:bg-foreground **:data-[slot=slider-track]:h-1"
                  />
                </Field>
              )}
            </form.Field>
          ))}
        </FieldGroup>
      </div>
    </>
  );
}
