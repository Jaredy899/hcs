import { cn } from "@/lib/utils";
import { getModifierKeyName } from "../hooks/useClientDetailsHotkeys";

interface HotkeyHintProps {
  hotkey: string;
  className?: string;
  show?: boolean;
}

export function HotkeyHint({ hotkey, className, show = true }: HotkeyHintProps) {
  if (!show) return null;

  // Hotkeys are written generically; swap the leading modifier for this platform's.
  const platformHotkey = hotkey.replace(/^(Ctrl|Alt)\+/, `${getModifierKeyName()}+`);

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
