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
      setTimeout(() => onRemove(toast.id), 400);
    }, 5000);

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
