import { useToastStore } from "../../utils/useToast.ts";
import "./Toast.css";

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label="Fermer la notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
