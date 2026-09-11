import { useState, useEffect, useRef } from 'react';

// Detect platform
export const isMac = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac');
export const getModifierKeyName = () => isMac ? 'Ctrl' : 'Alt';

/** True when the element accepts typed text, so hotkeys should stay out of the way. */
export function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable ||
    target.closest('[contenteditable="true"]') !== null
  );
}

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

interface HotkeyHandlers {
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
}

interface UseClientDetailsHotkeysOptions extends HotkeyHandlers {
  enabled?: boolean;
}

// Maps each hotkey action to the option that handles it. `toggleHotkeyHints` is
// handled internally and has no caller-provided handler.
const HANDLER_FOR_ACTION: Record<Exclude<ClientDetailsHotkeyAction, 'toggleHotkeyHints'>, keyof HotkeyHandlers> = {
  setLastContactToday: 'onSetLastContactToday',
  setFaceToFaceToday: 'onSetFaceToFaceToday',
  toggleFirstContact: 'onToggleFirstContact',
  toggleSecondContact: 'onToggleSecondContact',
  focusAddTodo: 'onFocusAddTodo',
  focusAddNote: 'onFocusAddNote',
  archiveClient: 'onArchiveClient',
  closeModal: 'onCloseModal',
  focusContactSection: 'onFocusContactSection',
  focusStatusSection: 'onFocusStatusSection',
  focusTodoSection: 'onFocusTodoSection',
  focusNotesSection: 'onFocusNotesSection',
  escape: 'onEscape',
};

export function useClientDetailsHotkeys({ enabled = true, ...handlers }: UseClientDetailsHotkeysOptions = {}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showHotkeyHints, setShowHotkeyHints] = useState(false);

  // Handlers are re-created on every render of the caller, so keep them in a ref
  // to avoid re-registering the document listeners on each render.
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const hotkey = CLIENT_DETAILS_HOTKEYS.find((h) => {
        if (event.key.toLowerCase() !== h.key.toLowerCase()) return false;
        if (event.shiftKey) return false;
        return h.useModifier
          ? (isMac ? event.ctrlKey : event.altKey)
          : (!event.ctrlKey && !event.altKey && !event.metaKey);
      });

      if (!hotkey) return;

      // While typing, let element-level handlers take over so Escape can clear or
      // blur the field instead of closing the modal.
      if (isEditableElement(event.target)) return;

      event.preventDefault();
      event.stopPropagation();

      if (hotkey.action === 'toggleHotkeyHints') {
        setShowHotkeyHints((prev) => !prev);
        return;
      }

      handlersRef.current[HANDLER_FOR_ACTION[hotkey.action]]?.();
    };

    // `focusout` fires before the next element is focused, so read `relatedTarget`
    // (the element about to receive focus) rather than `document.activeElement`.
    const handleFocusIn = (event: FocusEvent) => setIsEditing(isEditableElement(event.target));
    const handleFocusOut = (event: FocusEvent) => setIsEditing(isEditableElement(event.relatedTarget));

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [enabled]);

  return { isEditing, showHotkeyHints };
}
