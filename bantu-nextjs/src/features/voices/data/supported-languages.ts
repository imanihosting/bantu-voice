/**
 * Languages exposed in the language picker.
 *
 * Each entry maps a BCP-47 tag (stored on the Voice model) to a human-readable
 * label shown in the UI. The language subtag (before the first "-") is sent to
 * the BantuVoice TTS server as `language_id`.
 */

export type LanguageRegion =
  | "southern-africa"
  | "east-africa"
  | "west-africa"
  | "common";

export interface SupportedLanguage {
  value: string;
  label: string;
  region: LanguageRegion;
  /** True if the model needs fine-tuning for acceptable quality */
  needsFineTuning?: boolean;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  // --- Southern Africa ---
  { value: "zu-ZA", label: "Zulu", region: "southern-africa" },
  { value: "xh-ZA", label: "Xhosa", region: "southern-africa" },
  { value: "af-ZA", label: "Afrikaans", region: "southern-africa" },
  { value: "nso-ZA", label: "Sepedi (Northern Sotho)", region: "southern-africa" },
  { value: "tn-ZA", label: "Tswana", region: "southern-africa" },
  { value: "sn-ZW", label: "Shona", region: "southern-africa" },
  { value: "ts-ZA", label: "Xitsonga", region: "southern-africa" },
  { value: "ny-MW", label: "Chichewa", region: "southern-africa" },

  // --- East Africa ---
  { value: "sw-TZ", label: "Swahili", region: "east-africa" },
  { value: "rw-RW", label: "Kinyarwanda", region: "east-africa" },
  { value: "lg-UG", label: "Luganda", region: "east-africa" },
  { value: "am-ET", label: "Amharic", region: "east-africa" },
  { value: "om-ET", label: "Oromo", region: "east-africa" },
  { value: "so-SO", label: "Somali", region: "east-africa" },

  // --- West Africa ---
  { value: "yo-NG", label: "Yoruba", region: "west-africa" },
  { value: "ha-NG", label: "Hausa", region: "west-africa" },
  { value: "ig-NG", label: "Igbo", region: "west-africa" },

  // --- Common ---
  { value: "en-US", label: "English", region: "common" },
  { value: "fr-FR", label: "French", region: "common" },
  { value: "pt-BR", label: "Portuguese", region: "common" },
  { value: "ar-SA", label: "Arabic", region: "common" },
] as const;


/** Extract language subtag from BCP-47 (handles both 2 and 3 letter codes) */
export function getLanguageId(bcp47: string): string {
  return bcp47.split("-")[0];
}

/** All language IDs accepted by the BantuVoice TTS server */
export const SUPPORTED_LANGUAGE_IDS = SUPPORTED_LANGUAGES.map(
  (l) => getLanguageId(l.value),
);

/** Region display labels */
export const REGION_LABELS: Record<LanguageRegion, string> = {
  "southern-africa": "Southern Africa",
  "east-africa": "East Africa",
  "west-africa": "West Africa",
  "common": "Common Languages",
};

/** Get languages grouped by region */
export function getLanguagesByRegion() {
  const grouped = new Map<LanguageRegion, SupportedLanguage[]>();
  for (const lang of SUPPORTED_LANGUAGES) {
    const list = grouped.get(lang.region) ?? [];
    list.push(lang);
    grouped.set(lang.region, list);
  }
  return grouped;
}
