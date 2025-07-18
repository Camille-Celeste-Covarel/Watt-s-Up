import { Dialog, Transition } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";
import "./ConfirmationModal.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}: ConfirmationModalProps) {
  return (
    // Transition gère les animations d'apparition/disparition
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-1050" onClose={onClose}>
        {/* Le fond semi-transparent (backdrop) */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Le panneau de la modale */}
              <Dialog.Panel className="modal-panel">
                <Dialog.Title as="h3" className="modal-title">
                  {title}
                </Dialog.Title>
                <div className="modal-content">{children}</div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={onClose}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="button-primary"
                    onClick={onConfirm}
                  >
                    Confirmer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
