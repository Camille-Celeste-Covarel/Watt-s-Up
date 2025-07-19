import { type ReactNode, createContext, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface OverlayContextType {
  closeOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const closeOverlay = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const value = { closeOverlay };

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
};
