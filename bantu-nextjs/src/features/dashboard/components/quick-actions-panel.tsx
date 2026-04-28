import { quickActions } from "@/features/dashboard/data/quick-actions";
import { QuickActionCard } from "@/features/dashboard/components/quick-action-card";

export function QuickActionsPanel() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Templates</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            icon={action.icon}
            href={action.href}
          />
        ))}
      </div>
    </div>
  );
}
