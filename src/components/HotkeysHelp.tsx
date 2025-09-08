import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard, X } from 'lucide-react';
import { isMac } from '../hooks/useClientDetailsHotkeys';

interface HotkeysHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotkeysHelp({ isOpen, onClose }: HotkeysHelpProps) {
  if (!isOpen) return null;

  const compactViewKeys = isMac ? ['Ctrl', 'C'] : ['Alt', 'C'];

  const hotkeys = [
    { keys: ['/'], description: 'Focus search' },
    { keys: ['Ctrl', 'Shift', 'N'], description: 'Add new consumer' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Ctrl', 'Shift', 'S'], description: 'Toggle sticky notes' },
    { keys: ['Ctrl', 'Shift', 'K'], description: 'Create new sticky note' },
    { keys: compactViewKeys, description: 'Toggle compact view' },
    { keys: ['Esc'], description: 'Close modal/Go back/Hide notes' },
    { keys: ['Enter'], description: 'Select client (when only one search result)' },
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these keyboard shortcuts to navigate faster. Ctrl+Shift and Alt shortcuts work even when typing in search fields:
          </p>
          <div className="space-y-3">
            {hotkeys.map((hotkey, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{hotkey.description}</span>
                <div className="flex gap-1">
                  {hotkey.keys.map((key, keyIndex) => (
                    <span key={keyIndex} className="flex gap-1">
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted border rounded">
                        {key}
                      </kbd>
                      {keyIndex < hotkey.keys.length - 1 && (
                        <span className="text-muted-foreground">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              These shortcuts work consistently across all platforms and browsers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HotkeysButton({ onClick }: { onClick?: () => void }) {
  const [showHelp, setShowHelp] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowHelp(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="ghost"
        size="sm"
        className="gap-2"
        title="View keyboard shortcuts (? for hotkey)"
      >
        <Keyboard className="h-4 w-4" />
        <span className="hidden sm:inline">Shortcuts</span>
      </Button>
      {!onClick && <HotkeysHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />}
    </>
  );
} 