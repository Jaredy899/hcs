import { cn } from "@/lib/utils";
import { isMac } from "../hooks/useClientDetailsHotkeys";

interface HotkeyHintProps {
  hotkey: string;
  className?: string;
  show?: boolean;
}

export function HotkeyHint({ hotkey, className, show = true }: HotkeyHintProps) {
  if (!show) return null;

  // Convert generic hotkey to platform-specific
  const platformHotkey = hotkey.replace('Ctrl+', isMac ? 'Ctrl+' : 'Alt+').replace('Alt+', isMac ? 'Ctrl+' : 'Alt+');

  return (
    <kbd className={cn(
      "ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted/50 border rounded text-muted-foreground",
      "inline-flex items-center justify-center min-w-[20px] h-[18px]",
      className
    )}>
      {platformHotkey}
    </kbd>
  );
}
