import type { ReactNode } from "react";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";

// On ajoute une prop "title" pour le contenu du titre
export function Overlay({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const { closeOverlay } = useOverlay();

  // ❌ Toute la logique avec useRef et useEffect pour le <dialog> est supprimée.

  if (!children) {
    return null;
  }

  return (
    <div
      className="station-details-overlay open"
      aria-labelledby="overlay-title"
    >
      <h2 id="overlay-title" className="visually-hidden">
        {title}
      </h2>
      <button
        type="button"
        className="close-button"
        onClick={closeOverlay}
        aria-label="Fermer"
      >
        &times;
      </button>
      <div className="station-details-content">{children}</div>
    </div>
  );
}
