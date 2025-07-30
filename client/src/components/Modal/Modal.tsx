import { type MouseEvent, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import "./Modal.css";
import type { ModalProps } from "../../types/components/componentsTypes";

function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    if (isOpen) {
      dialogNode.showModal();
    } else {
      dialogNode.close();
    }
  }, [isOpen]);

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

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: The Escape key is the keyboard equivalent for closing the modal, which is handled natively by the <dialog> element's "close" event.
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
      {actions && <footer className="modal-footer">{actions}</footer>}
    </dialog>
  );
}

export default Modal;
