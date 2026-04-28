import { Badge } from "@/components/ui/badge";
import {
  SUPPORTED_LANGUAGES,
  REGION_LABELS,
  getLanguagesByRegion,
  type LanguageRegion,
} from "@/features/voices/data/supported-languages";

const REGION_ORDER: LanguageRegion[] = [
  "southern-africa",
  "east-africa",
  "west-africa",
  "common",
];

export function LanguagesGrid() {
  const grouped = getLanguagesByRegion();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {SUPPORTED_LANGUAGES.length} languages available for text-to-speech
        generation
      </p>

      {REGION_ORDER.map((region) => {
        const languages = grouped.get(region);
        if (!languages?.length) return null;

        return (
          <div key={region} className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              {REGION_LABELS[region]}
            </h4>
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((lang) => (
                <div
                  key={lang.value}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{lang.label}</span>
                    {lang.needsFineTuning && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {lang.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
