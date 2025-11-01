import { type ReactNode, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";
import ScrollToTopButton from "../ScrollToTopButton/ScrollToTopButton.tsx";

export function Overlay({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const { closeOverlay } = useOverlay();
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false);
  const overlayRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      setIsAnimatingOpen(true);
      if (overlayRef.current) {
        overlayRef.current.focus();

        const focusableElements = Array.from(
          overlayRef.current.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ) as HTMLElement[];

        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        handleClose();
      }

      if (event.key === "Tab" && overlayRef.current) {
        const focusableElements = Array.from(
          overlayRef.current.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ) as HTMLElement[];

        if (focusableElements.length === 0) {
          event.preventDefault();
          overlayRef.current.focus();
          return;
        }

        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement || !overlayRef.current.contains(document.activeElement)) {
            lastFocusableElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement || !overlayRef.current.contains(document.activeElement)) {
            firstFocusableElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, []);

  const handleClose = () => {
    setIsAnimatingOpen(false);
    setTimeout(() => {
      closeOverlay();
    }, 300);
  };

  if (!children || isMobile) {
    return null;
  }

  return (
    <dialog
      ref={overlayRef}
      className={`overlay ${isAnimatingOpen ? "open" : ""}`}
      aria-labelledby="overlay-title"
      open={isAnimatingOpen}
    >
      <span id="overlay-title" className="sr-only">{title}</span>
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
    </dialog>
  );
}
