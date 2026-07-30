import { cn } from "@/lib/utils";
import {
  STAGES,
  type LearningStage,
} from "@/features/meetings/types";

interface CircTabsProps {
  activeTab: LearningStage;
  onTabChange: (tab: LearningStage) => void;
}

export function CircTabs({
  activeTab,
  onTabChange,
}: CircTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex w-max gap-2 rounded-xl border bg-background p-2">
        {STAGES.map((step, index) => (
          <button
            key={step.key}
            type="button"
            onClick={() => onTabChange(step.key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
              activeTab === step.key
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {index + 1}. {step.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CircTabs;