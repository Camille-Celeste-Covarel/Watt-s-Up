import { useEffect, useState } from "react";
import type { Toast as ToastType } from "../../utils/useToast.ts";
import { useToastStore } from "../../utils/useToast.ts";
import "./Toast.css";

function Toast({
  toast,
  onRemove,
}: {
  toast: ToastType;
  onRemove: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Laisse le temps à l'animation de se terminer avant de supprimer du store
      setTimeout(() => onRemove(toast.id), 400);
    }, 5000);

    // Nettoie le timer si le composant est démonté avant (ex: clic sur la croix)
    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onRemove]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 400);
  };

  return (
    <div className={`toast toast-${toast.type} ${isExiting ? "exiting" : ""}`}>
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={handleRemove}
        aria-label="Fermer la notification"
      >
        &times;
      </button>
    </div>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

export default ToastContainer;
