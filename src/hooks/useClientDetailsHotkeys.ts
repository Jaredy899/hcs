import { useState, useEffect, useCallback } from 'react';

export type ClientDetailsHotkeyAction =
  | 'setLastContactToday'
  | 'setFaceToFaceToday'
  | 'toggleFirstContact'
  | 'toggleSecondContact'
  | 'focusAddTodo'
  | 'focusAddNote'
  | 'editNote'
  | 'saveNote'
  | 'cancelEdit'
  | 'archiveClient'
  | 'closeModal'
  | 'focusContactSection'
  | 'focusStatusSection'
  | 'focusTodoSection'
  | 'focusNotesSection'
  | 'escape';

interface HotkeyConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  action: ClientDetailsHotkeyAction;
  description: string;
}

// Detect platform for cross-platform hotkey support
export const isMac = navigator.userAgent.toLowerCase().includes('mac');
export const getModifierKeyName = () => isMac ? 'Ctrl' : 'Alt';

const CLIENT_DETAILS_HOTKEYS: HotkeyConfig[] = [
  { key: 't', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'setLastContactToday', description: 'Set Last Contact to Today' },
  { key: 'f', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'setFaceToFaceToday', description: 'Set Face-to-Face to Today' },
  { key: '1', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'toggleFirstContact', description: 'Toggle First Contact' },
  { key: '2', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'toggleSecondContact', description: 'Toggle Second Contact' },
  { key: 'n', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'focusAddTodo', description: 'Focus Add Todo' },
  { key: 'm', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'focusAddNote', description: 'Focus Add Note' },
  { key: 'e', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'editNote', description: 'Edit Selected Note' },
  { key: 's', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'saveNote', description: 'Save Note Changes' },
  { key: 'a', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'archiveClient', description: 'Archive Client' },
  { key: 'b', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'closeModal', description: 'Go Back' },
  { key: 'c', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'focusContactSection', description: 'Focus Contact Section' },
  { key: 's', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'focusStatusSection', description: 'Focus Status Section' },
  { key: 'o', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'focusTodoSection', description: 'Focus Todo Section' },
  { key: 'n', [isMac ? 'ctrlKey' : 'altKey']: true, action: 'focusNotesSection', description: 'Focus Notes Section' },
  { key: 'Escape', [isMac ? 'ctrlKey' : 'altKey']: false, action: 'escape', description: 'Cancel Editing or Close Modal' },
];

interface UseClientDetailsHotkeysOptions {
  onSetLastContactToday?: () => void;
  onSetFaceToFaceToday?: () => void;
  onToggleFirstContact?: () => void;
  onToggleSecondContact?: () => void;
  onFocusAddTodo?: () => void;
  onFocusAddNote?: () => void;
  onEditNote?: () => void;
  onSaveNote?: () => void;
  onCancelEdit?: () => void;
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
  onEditNote,
  onSaveNote,
  onCancelEdit,
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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const isInInput = (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    );

    // Debug logging (only for Ctrl key events)
    if (event.ctrlKey) {
      console.log('Hotkey event:', {
        key: event.key,
        ctrlKey: event.ctrlKey,
        isInInput: isInInput
      });
    }

    // Update editing state
    setIsEditing(!!isInInput);

    // Find matching hotkey
    const hotkey = CLIENT_DETAILS_HOTKEYS.find(h => {
      const keyMatches = event.key.toLowerCase() === h.key.toLowerCase();
      const modifierMatches = isMac
        ? !!h.ctrlKey === event.ctrlKey
        : !!h.altKey === event.altKey;
      return keyMatches && modifierMatches;
    });

    if (!hotkey) {
      // Special debug for modifier key presses
      const modifierPressed = isMac ? event.ctrlKey : event.altKey;
      if (modifierPressed) {
        const modifierName = isMac ? 'Control' : 'Alt';
        console.log(`${modifierName} key pressed but no hotkey match:`, event.key);
      }
      return;
    }

    console.log('Hotkey triggered:', hotkey.action);

    // Handle different cases based on input state
    if (isInInput) {
      // When editing, only allow certain hotkeys
      if (['cancelEdit', 'saveNote', 'escape'].includes(hotkey.action)) {
        event.preventDefault();
        event.stopPropagation();

        switch (hotkey.action) {
          case 'cancelEdit':
          case 'escape':
            onCancelEdit?.();
            break;
          case 'saveNote':
            onSaveNote?.();
            break;
        }
      }
      // Block other hotkeys when editing
      return;
    }

    // When not editing, allow all hotkeys
    event.preventDefault();
    event.stopPropagation();

    switch (hotkey.action) {
      case 'setLastContactToday':
        onSetLastContactToday?.();
        break;
      case 'setFaceToFaceToday':
        onSetFaceToFaceToday?.();
        break;
      case 'toggleFirstContact':
        onToggleFirstContact?.();
        break;
      case 'toggleSecondContact':
        onToggleSecondContact?.();
        break;
      case 'focusAddTodo':
        onFocusAddTodo?.();
        break;
      case 'focusAddNote':
        onFocusAddNote?.();
        break;
      case 'editNote':
        onEditNote?.();
        break;
      case 'saveNote':
        onSaveNote?.();
        break;
      case 'cancelEdit':
        onCancelEdit?.();
        break;
      case 'archiveClient':
        onArchiveClient?.();
        break;
      case 'closeModal':
        onCloseModal?.();
        break;
      case 'focusContactSection':
        onFocusContactSection?.();
        break;
      case 'focusStatusSection':
        onFocusStatusSection?.();
        break;
      case 'focusTodoSection':
        onFocusTodoSection?.();
        break;
      case 'focusNotesSection':
        onFocusNotesSection?.();
        break;
      case 'escape':
        onEscape?.();
        break;
    }
  }, [
    enabled,
    onSetLastContactToday,
    onSetFaceToFaceToday,
    onToggleFirstContact,
    onToggleSecondContact,
    onFocusAddTodo,
    onFocusAddNote,
    onEditNote,
    onSaveNote,
    onCancelEdit,
    onArchiveClient,
    onCloseModal,
    onFocusContactSection,
    onFocusStatusSection,
    onFocusTodoSection,
    onFocusNotesSection,
    onEscape,
  ]);

  useEffect(() => {
    // Listen on document with capture phase to get events before other handlers
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    // Listen for focus and blur events to update editing state
    const handleFocusIn = () => {
      const target = document.activeElement as HTMLElement;
      const isInInput = (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.contentEditable === 'true' ||
        target?.closest('[contenteditable="true"]')
      );
      setIsEditing(!!isInInput);
    };

    const handleFocusOut = () => {
      // Small delay to allow the new focus target to be set
      setTimeout(() => {
        const target = document.activeElement as HTMLElement;
        const isInInput = (
          target?.tagName === 'INPUT' ||
          target?.tagName === 'TEXTAREA' ||
          target?.contentEditable === 'true' ||
          target?.closest('[contenteditable="true"]')
        );
        setIsEditing(!!isInInput);
      }, 10);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [handleKeyDown]);

  return {
    hotkeys: CLIENT_DETAILS_HOTKEYS,
    isEditing,
  };
}
