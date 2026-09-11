import { Maximize2, Minimize2 } from "lucide-react";

export function CompactModeToggle({
  isCompact,
  onToggle,
}: {
  isCompact: boolean;
  onToggle: () => void;
}) {
  const label = isCompact ? "Expand view" : "Compact view";

  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-muted transition-colors"
      aria-label={label}
      title={label}
    >
      {isCompact ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
    </button>
  );
}
