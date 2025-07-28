import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Gère l'ouverture/fermeture programmatique de la modale
  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    if (isOpen) {
      dialogNode.showModal();
    } else {
      dialogNode.close();
    }
  }, [isOpen]);

  // Synchronise l'état React avec la fermeture native de la modale (ex: touche Echap)
  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    const handleClose = () => {
      onClose();
    };

    dialogNode.addEventListener("close", handleClose);

    return () => {
      dialogNode.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  // Gère le clic sur le fond (backdrop) pour fermer la modale
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: The Escape key is the keyboard equivalent for closing the modal, which is handled natively by the <dialog> element.
    <dialog
      ref={dialogRef}
      className="modal-dialog"
      onClick={handleBackdropClick}
    >
      <header className="modal-header">
        <h2>{title}</h2>
        <button
          type="button"
          className="modal-close-button"
          onClick={onClose}
          aria-label="Fermer la modale"
        >
          <FaTimes />
        </button>
      </header>
      <main className="modal-body">{children}</main>
    </dialog>
  );
}

export default Modal;
