import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";
import "./Overlay.css";

export function Overlay() {
  const { isOverlayOpen, overlayContent, closeOverlay } = useOverlay();

  return (
    <div className={`station-details-overlay ${isOverlayOpen ? "open" : ""}`}>
      <button
        onClick={closeOverlay}
        className="close-button"
        aria-label="Fermer"
        type="button"
      >
        &times;
      </button>
      <div className="station-details-content">{overlayContent}</div>
    </div>
  );
}
