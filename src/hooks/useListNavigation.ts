import { useState, useEffect, useRef, useCallback } from 'react';

interface UseListNavigationOptions<T extends { _id: string }> {
  items: T[];
  enabled?: boolean;
  focusedSection: string | null;
  sectionName: string;
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void;
  onToggle?: (item: T) => void;
}

/**
 * Shared keyboard navigation hook for list components (todos, notes, etc.)
 * Supports arrow keys for selection, Enter for edit, Delete/Backspace for delete,
 * Space for toggle, and Escape to clear selection.
 */
export function useListNavigation<T extends { _id: string }>({
  items,
  enabled = true,
  focusedSection,
  sectionName,
  onDelete,
  onEdit,
  onToggle,
}: UseListNavigationOptions<T>) {
  const [storedId, setSelectedId] = useState<string | null>(null);

  // Derived rather than stored, so a deleted item drops out of the selection
  // without an extra render pass.
  const selectedId = storedId !== null && items.some((item) => item._id === storedId) ? storedId : null;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (items.length === 0) return;
    if (!enabled || focusedSection !== sectionName) return;

    const currentIndex = selectedId ? items.findIndex((item) => item._id === selectedId) : -1;
    const selectedItem = currentIndex >= 0 ? items[currentIndex] : undefined;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        e.preventDefault();
        if (currentIndex < 0) {
          setSelectedId(items[0]._id);
          return;
        }
        const step = e.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = (currentIndex + step + items.length) % items.length;
        setSelectedId(items[nextIndex]._id);
        return;
      }

      case 'Enter':
        if (selectedItem && onEdit) {
          e.preventDefault();
          onEdit(selectedItem);
        }
        return;

      case ' ':
        if (selectedItem && onToggle) {
          e.preventDefault();
          onToggle(selectedItem);
        }
        return;

      case 'Delete':
      case 'Backspace':
        if (selectedItem && onDelete) {
          e.preventDefault();
          // Move the selection to a neighbour before the item disappears.
          const neighbour = items[currentIndex + 1] ?? items[currentIndex - 1];
          setSelectedId(neighbour?._id ?? null);
          onDelete(selectedItem);
        }
        return;

      case 'Escape':
        setSelectedId(null);
        return;
    }
  }, [items, selectedId, enabled, focusedSection, sectionName, onDelete, onEdit, onToggle]);

  // Held in a ref so the document listener is registered once instead of on every
  // change to items or callbacks.
  const handlerRef = useRef(handleKeyDown);
  useEffect(() => {
    handlerRef.current = handleKeyDown;
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handlerRef.current(e);
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, []);

  return { selectedId, setSelectedId };
}
