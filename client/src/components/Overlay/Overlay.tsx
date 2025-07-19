import { type ReactNode, useEffect, useState } from "react";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";

export function Overlay({
  children,
}: {
  children: ReactNode;
  title: string;
}) {
  const { closeOverlay } = useOverlay();
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimatingOpen(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimatingOpen(false);
    setTimeout(() => {
      closeOverlay();
    }, 300);
  };

  if (!children) {
    return null;
  }

  return (
    <div
      className={`station-details-overlay ${isAnimatingOpen ? "open" : ""}`}
      aria-labelledby="overlay-title"
    >
      <button
        type="button"
        className="close-button"
        onClick={handleClose}
        aria-label="Fermer"
      >
        &times;
      </button>
      <div className="station-details-content">{children}</div>
    </div>
  );
}
