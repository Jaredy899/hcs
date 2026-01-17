import { useState, useEffect, useCallback } from 'react';

interface UseListNavigationOptions<T extends { _id: string }> {
  items: T[];
  enabled?: boolean;
  focusedSection: string | null;
  sectionName: string;
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void;
  onToggle?: (item: T) => void;
}

interface UseListNavigationReturn<T extends { _id: string }> {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
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
}: UseListNavigationOptions<T>): UseListNavigationReturn<T> {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset selection when items change or selected item is deleted
  useEffect(() => {
    if (selectedId && !items.find(item => item._id === selectedId)) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (items.length === 0) return;
    if (!enabled || focusedSection !== sectionName) return;

    const currentIndex = selectedId 
      ? items.findIndex(item => item._id === selectedId)
      : -1;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex >= 0) {
          const newIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          setSelectedId(items[newIndex]._id);
        } else {
          setSelectedId(items[0]._id);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex >= 0) {
          const newIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
          setSelectedId(items[newIndex]._id);
        } else {
          setSelectedId(items[0]._id);
        }
        break;

      case 'Enter':
        if (selectedId && onEdit) {
          e.preventDefault();
          const selectedItem = items.find(item => item._id === selectedId);
          if (selectedItem) {
            onEdit(selectedItem);
          }
        }
        break;

      case ' ':
        if (selectedId && onToggle) {
          e.preventDefault();
          const selectedItem = items.find(item => item._id === selectedId);
          if (selectedItem) {
            onToggle(selectedItem);
          }
        }
        break;

      case 'Delete':
      case 'Backspace':
        if (selectedId && onDelete) {
          e.preventDefault();
          const selectedItem = items.find(item => item._id === selectedId);
          if (selectedItem) {
            // Move to next item before deleting
            if (currentIndex < items.length - 1) {
              setSelectedId(items[currentIndex + 1]._id);
            } else if (items.length > 1) {
              setSelectedId(items[currentIndex - 1]._id);
            } else {
              setSelectedId(null);
            }
            onDelete(selectedItem);
          }
        }
        break;

      case 'Escape':
        setSelectedId(null);
        break;
    }
  }, [items, selectedId, enabled, focusedSection, sectionName, onDelete, onEdit, onToggle]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    selectedId,
    setSelectedId,
    handleKeyDown,
  };
}
