import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { globalContextType } from "./OverlayType.ts";

const OverlayContext = createContext<globalContextType | undefined>(undefined);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayContent, setOverlayContent] = useState<ReactNode | null>(null);

  const openOverlay = useCallback((content: ReactNode) => {
    setOverlayContent(content);
    setIsOverlayOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setTimeout(() => setOverlayContent(null), 300);
  }, []);

  return (
    <OverlayContext.Provider
      value={{ isOverlayOpen, overlayContent, openOverlay, closeOverlay }}
    >
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
};
