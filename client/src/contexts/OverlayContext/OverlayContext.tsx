import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { isMobile } from "react-device-detect";
// On retire useLocation qui n'est plus utilisé
import { useMatches, useNavigate } from "react-router-dom";

// On ajoute la même interface que dans App.tsx pour typer le handle
interface RouteHandle {
  isOverlay?: boolean;
}

// On ne passe plus le contenu ici
interface OverlayContextType {
  isOverlayOpen: boolean;
  closeOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

// Le provider n'a plus besoin de `children` car il est utilisé dans App.tsx
export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const navigate = useNavigate();
  const matches = useMatches();

  // On vérifie si la route actuelle est une route d'overlay, en utilisant l'assertion de type
  const isOverlayRoute = matches.some(
    (match) => (match.handle as RouteHandle)?.isOverlay,
  );

  // L'état d'ouverture est maintenant synchronisé avec l'URL
  useEffect(() => {
    // L'overlay ne s'ouvre que sur desktop ET si la route est marquée
    setIsOverlayOpen(!isMobile && isOverlayRoute);
  }, [isOverlayRoute]);

  // La fonction de fermeture redirige simplement vers la page d'accueil
  const closeOverlay = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <OverlayContext.Provider value={{ isOverlayOpen, closeOverlay }}>
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
