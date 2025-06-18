import { Maximize2, Minimize2 } from "lucide-react";

export function CompactModeToggle({ 
  isCompact, 
  onToggle 
}: { 
  isCompact: boolean; 
  onToggle: () => void; 
}) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={isCompact ? "Expand view" : "Compact view"}
      title={isCompact ? "Expand view" : "Compact view"}
    >
      {isCompact ? (
        <Maximize2 className="w-5 h-5" />
      ) : (
        <Minimize2 className="w-5 h-5" />
      )}
    </button>
  );
} 