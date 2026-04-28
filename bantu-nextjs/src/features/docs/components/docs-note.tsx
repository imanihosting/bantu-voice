import { AlertTriangle, Info, Lightbulb } from "lucide-react";

interface DocsNoteProps {
  variant?: "info" | "warning" | "tip";
  title?: string;
  children: React.ReactNode;
}

const variants = {
  info: {
    icon: Info,
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-500",
    defaultTitle: "Note",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-500",
    defaultTitle: "Warning",
  },
  tip: {
    icon: Lightbulb,
    borderColor: "border-l-green-500",
    iconColor: "text-green-500",
    defaultTitle: "Tip",
  },
};

export function DocsNote({
  variant = "info",
  title,
  children,
}: DocsNoteProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border border-l-4 ${config.borderColor} bg-muted/50 p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`size-4 ${config.iconColor}`} />
        <span className="text-sm font-semibold">
          {title ?? config.defaultTitle}
        </span>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}
