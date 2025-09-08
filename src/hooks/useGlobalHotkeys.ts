import { useEffect } from 'react';

export type HotkeyAction = 'focusSearch' | 'escape' | 'addClient' | 'showHelp' | 'toggleStickyNotes' | 'newStickyNote' | 'toggleCompactMode';

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
  { key: 's', ctrlKey: true, shiftKey: true, action: 'toggleStickyNotes' },
  { key: 'k', ctrlKey: true, shiftKey: true, action: 'newStickyNote' },
  { key: 'c', altKey: true, action: 'toggleCompactMode' },
];

interface UseGlobalHotkeysOptions {
  onFocusSearch?: () => void;
  onEscape?: () => void;
  onAddClient?: () => void;
  onShowHelp?: () => void;
  onToggleStickyNotes?: () => void;
  onNewStickyNote?: () => void;
  onToggleCompactMode?: () => void;
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
  onToggleCompactMode,
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
        // Platform-specific modifier handling
        let modifierMatches = false;
        if (hotkey.ctrlKey) {
          modifierMatches = event.ctrlKey;
        } else if (hotkey.altKey) {
          // For Alt key shortcuts, also accept Ctrl on Mac (Cmd key)
          modifierMatches = event.altKey || (event.ctrlKey && navigator.userAgent.toLowerCase().includes('mac'));
        } else {
          modifierMatches = !event.ctrlKey && !event.altKey && !event.metaKey;
        }
        const shiftMatches = !!hotkey.shiftKey === event.shiftKey;
        const metaMatches = !!hotkey.metaKey === event.metaKey;

        if (keyMatches && modifierMatches && shiftMatches && metaMatches) {
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
            else if (modifierMatches && (hotkey.altKey || hotkey.ctrlKey || hotkey.metaKey)) {
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
                case 'toggleCompactMode':
                  onToggleCompactMode?.();
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
              case 'toggleCompactMode':
                onToggleCompactMode?.();
                break;
            }
            break; // Stop checking after first match
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onFocusSearch, onEscape, onAddClient, onShowHelp, onToggleStickyNotes, onNewStickyNote, onToggleCompactMode, enabled, customHotkeys]);

  return {
    // Return the default hotkeys for display purposes
    hotkeys: DEFAULT_HOTKEYS,
  };
} 