import { Mic, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { SUPPORTED_LANGUAGES } from "@/features/voices/data/supported-languages";

interface StatIndicatorProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatIndicator({ icon, label, value }: StatIndicatorProps) {
  return (
    <Badge variant="outline" className="gap-1.5 border-dashed py-1 px-2.5">
      {icon}
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs font-semibold tabular-nums">{value}</span>
    </Badge>
  );
}

export async function StatIndicators() {
  const voiceCount = await prisma.voice.count();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatIndicator
        icon={<Mic className="size-3 text-chart-1" />}
        label="Voices Available"
        value={voiceCount}
      />
      <StatIndicator
        icon={<Globe className="size-3 text-chart-2" />}
        label="Languages"
        value={SUPPORTED_LANGUAGES.length}
      />
    </div>
  );
}
