import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseDraggableOptions {
  elementRef: RefObject<HTMLElement>;
  onMove: (x: number, y: number) => void;
  initialPosition?: { x: number; y: number };
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
  handleMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Hook for making elements draggable
 */
export function useDraggable({
  elementRef,
  onMove,
  bounds = {},
  disabled = false,
}: UseDraggableOptions): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || 
        target.tagName === 'INPUT' || 
        target.closest('button')) {
      return;
    }
    
    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [elementRef, disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    let x = e.clientX - dragOffset.x;
    let y = e.clientY - dragOffset.y;
    
    // Apply bounds
    const { minX = 0, maxX, minY = 0, maxY } = bounds;
    x = Math.max(minX, maxX !== undefined ? Math.min(maxX, x) : x);
    y = Math.max(minY, maxY !== undefined ? Math.min(maxY, y) : y);
    
    onMove(x, y);
  }, [isDragging, dragOffset, bounds, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    handleMouseDown,
  };
}
