import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGUAGES } from "@/features/voices/data/supported-languages";

const ABOUT_ROWS = [
  { label: "Application", value: "TaurAI" },
  { label: "Description", value: "AI-powered text-to-speech & voice cloning" },
  { label: "TTS Engine", value: "Meta MMS-TTS" },
  { label: "Languages", value: `${SUPPORTED_LANGUAGES.length} supported` },
] as const;

export function AboutSection() {
  return (
    <div className="space-y-3">
      {ABOUT_ROWS.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-medium">{row.value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Mode</span>
        <Badge variant="secondary">Self-hosted</Badge>
      </div>
    </div>
  );
}
