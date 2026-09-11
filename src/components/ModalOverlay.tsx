import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

interface ModalOverlayProps {
  onDismiss: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * Dimmed full-screen backdrop that dismisses on a click of its own. The press
 * must both start and end on the backdrop, so releasing a text selection or a
 * popover dismissal over it does not close the modal.
 */
export function ModalOverlay({ onDismiss, className, children }: ModalOverlayProps) {
  const pressedOnOverlay = useRef(false);

  return (
    <div
      className={cn("fixed inset-0 bg-black/50 flex items-center justify-center z-50", className)}
      onPointerDown={(e) => {
        pressedOnOverlay.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressedOnOverlay.current) onDismiss();
      }}
    >
      {children}
    </div>
  );
}
