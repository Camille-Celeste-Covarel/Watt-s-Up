import type { ReactNode } from "react";

export interface globalContextType {
  isOverlayOpen: boolean;
  overlayContent: ReactNode | null;
  openOverlay: (content: ReactNode) => void;
  closeOverlay: () => void;
}
