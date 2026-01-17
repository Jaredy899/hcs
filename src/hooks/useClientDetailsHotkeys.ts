import { useState, useEffect, useCallback } from 'react';

// Detect platform
export const isMac = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac');
export const getModifierKeyName = () => isMac ? 'Ctrl' : 'Alt';

export type ClientDetailsHotkeyAction =
  | 'setLastContactToday'
  | 'setFaceToFaceToday'
  | 'toggleFirstContact'
  | 'toggleSecondContact'
  | 'focusAddTodo'
  | 'focusAddNote'
  | 'archiveClient'
  | 'closeModal'
  | 'focusContactSection'
  | 'focusStatusSection'
  | 'focusTodoSection'
  | 'focusNotesSection'
  | 'escape'
  | 'toggleHotkeyHints';

interface HotkeyConfig {
  key: string;
  useModifier: boolean;
  action: ClientDetailsHotkeyAction;
  description: string;
}

// Define hotkeys with a flag for modifier key (Ctrl on Mac, Alt on Windows/Linux)
const CLIENT_DETAILS_HOTKEYS: HotkeyConfig[] = [
  { key: 't', useModifier: true, action: 'setLastContactToday', description: 'Set Last Contact to Today' },
  { key: 'f', useModifier: true, action: 'setFaceToFaceToday', description: 'Set Face-to-Face to Today' },
  { key: '1', useModifier: true, action: 'toggleFirstContact', description: 'Toggle First Contact' },
  { key: '2', useModifier: true, action: 'toggleSecondContact', description: 'Toggle Second Contact' },
  { key: 'n', useModifier: true, action: 'focusAddTodo', description: 'Focus Add Todo' },
  { key: 'm', useModifier: true, action: 'focusAddNote', description: 'Focus Add Note' },
  { key: 'a', useModifier: true, action: 'archiveClient', description: 'Archive Client' },
  { key: 'b', useModifier: true, action: 'closeModal', description: 'Go Back' },
  { key: 'c', useModifier: true, action: 'focusContactSection', description: 'Focus Contact Section' },
  { key: 'u', useModifier: true, action: 'focusStatusSection', description: 'Focus Status Section' },
  { key: 'd', useModifier: true, action: 'focusTodoSection', description: 'Focus Todo Section' },
  { key: 'o', useModifier: true, action: 'focusNotesSection', description: 'Focus Notes Section' },
  { key: 'h', useModifier: true, action: 'toggleHotkeyHints', description: 'Toggle Hotkey Hints' },
  { key: 'Escape', useModifier: false, action: 'escape', description: 'Cancel Editing or Close Modal' },
];

interface UseClientDetailsHotkeysOptions {
  onSetLastContactToday?: () => void;
  onSetFaceToFaceToday?: () => void;
  onToggleFirstContact?: () => void;
  onToggleSecondContact?: () => void;
  onFocusAddTodo?: () => void;
  onFocusAddNote?: () => void;
  onArchiveClient?: () => void;
  onCloseModal?: () => void;
  onFocusContactSection?: () => void;
  onFocusStatusSection?: () => void;
  onFocusTodoSection?: () => void;
  onFocusNotesSection?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useClientDetailsHotkeys({
  onSetLastContactToday,
  onSetFaceToFaceToday,
  onToggleFirstContact,
  onToggleSecondContact,
  onFocusAddTodo,
  onFocusAddNote,
  onArchiveClient,
  onCloseModal,
  onFocusContactSection,
  onFocusStatusSection,
  onFocusTodoSection,
  onFocusNotesSection,
  onEscape,
  enabled = true,
}: UseClientDetailsHotkeysOptions = {}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showHotkeyHints, setShowHotkeyHints] = useState(false);

  // Map actions to handlers
  const actionHandlers: Record<ClientDetailsHotkeyAction, (() => void) | undefined> = {
    setLastContactToday: onSetLastContactToday,
    setFaceToFaceToday: onSetFaceToFaceToday,
    toggleFirstContact: onToggleFirstContact,
    toggleSecondContact: onToggleSecondContact,
    focusAddTodo: onFocusAddTodo,
    focusAddNote: onFocusAddNote,
    archiveClient: onArchiveClient,
    closeModal: onCloseModal,
    focusContactSection: onFocusContactSection,
    focusStatusSection: onFocusStatusSection,
    focusTodoSection: onFocusTodoSection,
    focusNotesSection: onFocusNotesSection,
    escape: onEscape,
    toggleHotkeyHints: () => setShowHotkeyHints(prev => !prev),
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const isInInput = (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    );

    setIsEditing(!!isInInput);

    // Find matching hotkey
    const hotkey = CLIENT_DETAILS_HOTKEYS.find(h => {
      const keyMatches = event.key.toLowerCase() === h.key.toLowerCase();
      const modifierMatches = h.useModifier
        ? (isMac ? event.ctrlKey : event.altKey)
        : (!event.ctrlKey && !event.altKey);
      return keyMatches && modifierMatches;
    });

    if (!hotkey) return;

    // When in input, only allow escape
    if (isInInput && hotkey.action !== 'escape') return;

    event.preventDefault();
    event.stopPropagation();

    const handler = actionHandlers[hotkey.action];
    handler?.();
  }, [enabled, actionHandlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    // Track editing state via focus events
    const handleFocusChange = () => {
      const target = document.activeElement as HTMLElement;
      const isInInput = (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.contentEditable === 'true' ||
        target?.closest('[contenteditable="true"]')
      );
      setIsEditing(!!isInInput);
    };

    document.addEventListener('focusin', handleFocusChange);
    document.addEventListener('focusout', () => setTimeout(handleFocusChange, 10));

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('focusin', handleFocusChange);
      document.removeEventListener('focusout', () => {});
    };
  }, [handleKeyDown]);

  return {
    hotkeys: CLIENT_DETAILS_HOTKEYS,
    isEditing,
    showHotkeyHints,
  };
}
