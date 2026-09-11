import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  elementRef: RefObject<HTMLElement | null>;
  /** Called once when the drag ends, so the position is persisted a single time. */
  onMoveEnd: (x: number, y: number) => void;
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  disabled?: boolean;
}

interface UseDraggableReturn {
  isDragging: boolean;
  /** Local position once the element has been dragged, otherwise null. */
  dragPosition: Position | null;
  handleMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Hook for making elements draggable. The position is tracked locally during the
 * drag and reported once on release.
 */
export function useDraggable({
  elementRef,
  onMoveEnd,
  bounds = {},
  disabled = false,
}: UseDraggableOptions): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);

  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const latestPosition = useRef<Position | null>(null);
  const boundsRef = useRef(bounds);
  const onMoveEndRef = useRef(onMoveEnd);
  useEffect(() => {
    boundsRef.current = bounds;
    onMoveEndRef.current = onMoveEnd;
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.closest('button')) {
      return;
    }

    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    setIsDragging(true);
  }, [elementRef, disabled]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { minX = 0, maxX, minY = 0, maxY } = boundsRef.current;
      const clamp = (value: number, min: number, max?: number) =>
        Math.max(min, max !== undefined ? Math.min(max, value) : value);

      const next = {
        x: clamp(e.clientX - dragOffset.current.x, minX, maxX),
        y: clamp(e.clientY - dragOffset.current.y, minY, maxY),
      };
      latestPosition.current = next;
      setDragPosition(next);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (latestPosition.current) {
        onMoveEndRef.current(latestPosition.current.x, latestPosition.current.y);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return { isDragging, dragPosition, handleMouseDown };
}
