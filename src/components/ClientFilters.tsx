import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseloadFilter, CASELOAD_FILTERS } from "@/lib/caseloadFilters";

interface ClientFiltersProps {
  counts: Record<CaseloadFilter, number>;
  active: CaseloadFilter[];
  onToggle: (filter: CaseloadFilter) => void;
  onClear: () => void;
}

export function ClientFilters({ counts, active, onToggle, onClear }: ClientFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CASELOAD_FILTERS.map((filter) => {
        const isActive = active.includes(filter.key);
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onToggle(filter.key)}
            title={filter.title}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {filter.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                isActive ? "bg-primary-foreground/20" : "bg-muted"
              )}
            >
              {counts[filter.key]}
            </span>
          </button>
        );
      })}
      {active.length > 0 && (
        <Button onClick={onClear} variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
