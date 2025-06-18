import { useEffect } from 'react';

export type HotkeyAction = 'focusSearch' | 'escape' | 'addClient' | 'showHelp' | 'toggleStickyNotes' | 'newStickyNote';

interface HotkeyConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: HotkeyAction;
}

const DEFAULT_HOTKEYS: HotkeyConfig[] = [
  { key: '/', action: 'focusSearch' },
  { key: 'Escape', action: 'escape' },
  { key: 'n', ctrlKey: true, shiftKey: true, action: 'addClient' },
  { key: '?', action: 'showHelp' },
  { key: '?', shiftKey: true, action: 'showHelp' }, // For keyboards that need shift for ?
  { key: 's', ctrlKey: true, shiftKey: true, action: 'toggleStickyNotes' },
  { key: 'k', ctrlKey: true, shiftKey: true, action: 'newStickyNote' },
];

interface UseGlobalHotkeysOptions {
  onFocusSearch?: () => void;
  onEscape?: () => void;
  onAddClient?: () => void;
  onShowHelp?: () => void;
  onToggleStickyNotes?: () => void;
  onNewStickyNote?: () => void;
  enabled?: boolean;
  customHotkeys?: HotkeyConfig[];
}

export function useGlobalHotkeys({
  onFocusSearch,
  onEscape,
  onAddClient,
  onShowHelp,
  onToggleStickyNotes,
  onNewStickyNote,
  enabled = true,
  customHotkeys = [],
}: UseGlobalHotkeysOptions = {}) {
  useEffect(() => {
    if (!enabled) return;

    const hotkeys = [...DEFAULT_HOTKEYS, ...customHotkeys];

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInInput = (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('[contenteditable="true"]')
      );

      // Check each hotkey configuration
      for (const hotkey of hotkeys) {
        const keyMatches = event.key.toLowerCase() === hotkey.key.toLowerCase();
        const ctrlMatches = !!hotkey.ctrlKey === event.ctrlKey;
        const altMatches = !!hotkey.altKey === event.altKey;
        const shiftMatches = !!hotkey.shiftKey === event.shiftKey;
        const metaMatches = !!hotkey.metaKey === event.metaKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
          // If user is typing in an input, only allow certain hotkeys
          if (isInInput) {
            // Always allow Escape
            if (hotkey.action === 'escape') {
              event.preventDefault();
              event.stopPropagation();
              onEscape?.();
              break;
            }
            // Allow hotkeys with modifier keys (Alt, Ctrl, Meta) since they're unlikely to interfere with typing
            else if (hotkey.altKey || hotkey.ctrlKey || hotkey.metaKey) {
              event.preventDefault();
              event.stopPropagation();
              
              switch (hotkey.action) {
                case 'addClient':
                  onAddClient?.();
                  break;
                case 'toggleStickyNotes':
                  onToggleStickyNotes?.();
                  break;
                case 'newStickyNote':
                  onNewStickyNote?.();
                  break;
              }
              break;
            }
            // Block simple keys like / and ? when typing in inputs
            else {
              continue;
            }
          }
          // If not in an input, allow all hotkeys
          else {
            event.preventDefault();
            event.stopPropagation();

            switch (hotkey.action) {
              case 'focusSearch':
                onFocusSearch?.();
                break;
              case 'escape':
                onEscape?.();
                break;
              case 'addClient':
                onAddClient?.();
                break;
              case 'showHelp':
                onShowHelp?.();
                break;
              case 'toggleStickyNotes':
                onToggleStickyNotes?.();
                break;
              case 'newStickyNote':
                onNewStickyNote?.();
                break;
            }
            break; // Stop checking after first match
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onFocusSearch, onEscape, onAddClient, onShowHelp, onToggleStickyNotes, onNewStickyNote, enabled, customHotkeys]);

  return {
    // Return the default hotkeys for display purposes
    hotkeys: DEFAULT_HOTKEYS,
  };
} 