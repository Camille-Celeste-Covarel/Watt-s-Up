import { type ReactNode, useEffect, useRef, useState } from "react";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";
import ScrollToTopButton from "../ScrollToTopButton/ScrollToTopButton.tsx";

export function Overlay({
  children,
}: {
  children: ReactNode;
  title: string;
}) {
  const { closeOverlay } = useOverlay();
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
      className={`overlay ${isAnimatingOpen ? "open" : ""}`}
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
      <div ref={contentRef} className="overlay-content">
        {children}
      </div>
      <ScrollToTopButton targetRef={contentRef} />
    </div>
  );
}
