import { type ReactNode, useEffect, useRef } from "react";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";

// On ajoute une prop "title" pour le contenu du titre
export function Overlay({
  children,
  title,
}: {
  children: ReactNode;
  title: string; // Le titre est maintenant requis et doit être une chaîne de caractères
}) {
  const { isOverlayOpen, closeOverlay } = useOverlay();
  const overlayRef = useRef<HTMLDialogElement>(null);

  // Cet effet synchronise l'état de la modale (ouverte/fermée) avec notre état React
  useEffect(() => {
    const dialog = overlayRef.current;
    if (!dialog) return;

    if (isOverlayOpen) {
      // ON CHANGE ICI : On utilise .show() pour un affichage non-modal
      dialog.show();
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOverlayOpen]);

  // Cet effet gère la fermeture avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // On s'assure de ne fermer que si l'overlay est bien ouvert
        if (isOverlayOpen) {
          closeOverlay();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOverlayOpen, closeOverlay]); // On ajoute isOverlayOpen aux dépendances

  if (!children) {
    return null;
  }

  return (
    <dialog
      ref={overlayRef}
      className="station-details-overlay"
      aria-labelledby="overlay-title"
    >
      {/* On utilise la prop "title" pour donner un contenu accessible au titre */}
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
    </dialog>
  );
}
