import type { ReactNode } from "react";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";
import "./Overlay.css";

export function Overlay({ children }: { children: ReactNode }) {
  const { closeOverlay } = useOverlay();

  // Le composant est maintenant un simple <aside> qui s'affiche ou non
  // grâce au rendu conditionnel dans App.tsx. Il n'a plus besoin de logique interne.
  return (
    <aside className="station-details-overlay" aria-label="Panneau de détails">
      <button
        type="button"
        className="close-button"
        onClick={closeOverlay}
        aria-label="Fermer"
      >
        &times;
      </button>
      {children}
    </aside>
  );
}
