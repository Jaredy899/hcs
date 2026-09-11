import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard, X } from 'lucide-react';
import { GLOBAL_HOTKEYS, describeHotkey } from '../hooks/useGlobalHotkeys';

interface HotkeysHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

// Handled by the search field itself rather than the global hotkey table.
const EXTRA_SHORTCUTS = [
  { keys: ['Enter'], description: 'Select consumer (when only one search result)' },
];

export function HotkeysHelp({ isOpen, onClose }: HotkeysHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    ...GLOBAL_HOTKEYS.map((hotkey) => ({
      keys: describeHotkey(hotkey),
      description: hotkey.description,
    })),
    ...EXTRA_SHORTCUTS,
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these keyboard shortcuts to navigate faster. Shortcuts with a modifier key work even
            while typing in the search field.
          </p>
          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.description} className="flex items-center justify-between gap-4">
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {shortcut.keys.map((key, index) => (
                    <span key={key} className="flex items-center gap-1">
                      {index > 0 && <span className="text-muted-foreground">+</span>}
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted border rounded">{key}</kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Open a consumer and press the shortcuts key again to see the shortcuts available there.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HotkeysButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="gap-2"
      title="View keyboard shortcuts"
    >
      <Keyboard className="h-4 w-4" />
      <span className="hidden sm:inline">Shortcuts</span>
    </Button>
  );
}
