"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getLanguagesByRegion,
  REGION_LABELS,
  type LanguageRegion,
} from "@/features/voices/data/supported-languages";

const regionOrder: LanguageRegion[] = [
  "southern-africa",
  "east-africa",
  "west-africa",
  "common",
];

interface LanguageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  value,
  onValueChange,
  disabled,
}: LanguageSelectorProps) {
  const grouped = getLanguagesByRegion();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Auto-detect language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto-detect</SelectItem>
        {regionOrder.map((region) => {
          const languages = grouped.get(region);
          if (!languages?.length) return null;
          return (
            <SelectGroup key={region}>
              <SelectLabel>{REGION_LABELS[region]}</SelectLabel>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}
