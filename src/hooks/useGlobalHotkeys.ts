import { useEffect, useRef } from 'react';
import { isEditableElement, isMac } from './useClientDetailsHotkeys';

export type HotkeyAction =
  | 'focusSearch'
  | 'escape'
  | 'addClient'
  | 'showHelp'
  | 'toggleStickyNotes'
  | 'newStickyNote'
  | 'toggleCompactMode';

interface GlobalHotkey {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: HotkeyAction;
  description: string;
  /** Whether the hotkey still fires while the user is typing in a field. */
  allowInInput: boolean;
}

export const GLOBAL_HOTKEYS: GlobalHotkey[] = [
  { key: '/', action: 'focusSearch', description: 'Focus search', allowInInput: false },
  { key: 'Escape', action: 'escape', description: 'Close modal / go back / hide notes', allowInInput: true },
  { key: 'n', ctrlKey: true, shiftKey: true, action: 'addClient', description: 'Add new consumer', allowInInput: true },
  { key: 'h', ctrlKey: true, action: 'showHelp', description: 'Show keyboard shortcuts', allowInInput: true },
  { key: 's', ctrlKey: true, shiftKey: true, action: 'toggleStickyNotes', description: 'Toggle sticky notes', allowInInput: true },
  { key: 'k', ctrlKey: true, shiftKey: true, action: 'newStickyNote', description: 'Create new sticky note', allowInInput: true },
  { key: 'c', altKey: true, action: 'toggleCompactMode', description: 'Toggle compact view', allowInInput: true },
];

/** Human-readable key labels for a hotkey, adjusted for the current platform. */
export function describeHotkey(hotkey: GlobalHotkey): string[] {
  const keys: string[] = [];
  if (hotkey.ctrlKey) keys.push('Ctrl');
  if (hotkey.altKey) keys.push(isMac ? 'Ctrl' : 'Alt');
  if (hotkey.shiftKey) keys.push('Shift');
  keys.push(hotkey.key === 'Escape' ? 'Esc' : hotkey.key.toUpperCase());
  return keys;
}

interface GlobalHotkeyHandlers {
  onFocusSearch?: () => void;
  onEscape?: () => void;
  onAddClient?: () => void;
  onShowHelp?: () => void;
  onToggleStickyNotes?: () => void;
  onNewStickyNote?: () => void;
  onToggleCompactMode?: () => void;
}

interface UseGlobalHotkeysOptions extends GlobalHotkeyHandlers {
  enabled?: boolean;
}

const HANDLER_FOR_ACTION: Record<HotkeyAction, keyof GlobalHotkeyHandlers> = {
  focusSearch: 'onFocusSearch',
  escape: 'onEscape',
  addClient: 'onAddClient',
  showHelp: 'onShowHelp',
  toggleStickyNotes: 'onToggleStickyNotes',
  newStickyNote: 'onNewStickyNote',
  toggleCompactMode: 'onToggleCompactMode',
};

function matches(event: KeyboardEvent, hotkey: GlobalHotkey): boolean {
  if (event.key.toLowerCase() !== hotkey.key.toLowerCase()) return false;
  if (!!hotkey.shiftKey !== event.shiftKey) return false;

  if (hotkey.ctrlKey) return event.ctrlKey;
  // Mac keyboards reach for Ctrl where Windows/Linux use Alt.
  if (hotkey.altKey) return event.altKey || (isMac && event.ctrlKey);
  return !event.ctrlKey && !event.altKey && !event.metaKey;
}

export function useGlobalHotkeys({ enabled = true, ...handlers }: UseGlobalHotkeysOptions = {}) {
  // Callers pass fresh inline handlers every render; keep them in a ref so the
  // document listener is registered once.
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const hotkey = GLOBAL_HOTKEYS.find((candidate) => matches(event, candidate));
      if (!hotkey) return;
      if (!hotkey.allowInInput && isEditableElement(event.target)) return;

      event.preventDefault();
      event.stopPropagation();
      handlersRef.current[HANDLER_FOR_ACTION[hotkey.action]]?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
