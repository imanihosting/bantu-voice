import { useQueryState } from "nuqs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";
import { SUPPORTED_LANGUAGES } from "@/features/voices/data/supported-languages";
import { voicesSearchParams } from "@/features/voices/lib/params";

const LANGUAGE_GROUPS = SUPPORTED_LANGUAGES.map((l) => ({
  value: l.value,
  label: l.label,
}));

const CATEGORY_ENTRIES = Object.entries(VOICE_CATEGORY_LABELS) as [
  string,
  string,
][];

export function VoiceFilters() {
  const [category, setCategory] = useQueryState(
    "category",
    voicesSearchParams.category,
  );
  const [language, setLanguage] = useQueryState(
    "language",
    voicesSearchParams.language,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={category || "all"}
        onValueChange={(v) => setCategory(v === "all" ? "" : v)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[140px] text-xs">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORY_ENTRIES.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={language || "all"}
        onValueChange={(v) => setLanguage(v === "all" ? "" : v)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[140px] text-xs">
          <SelectValue placeholder="All Languages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {LANGUAGE_GROUPS.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
