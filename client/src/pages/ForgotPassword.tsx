import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "../components/Modal/Modal";
import "../stylesheets/forgotpassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [confirmationEmail, setConfirmationEmail] = useState<string>("");
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (confirmationEmail !== email) {
      setModalState({
        isOpen: true,
        title: "Erreur",
        message: "Les adresses mail ne correspondent pas.",
      });
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setModalState({
        isOpen: true,
        title: "Demande envoyée",
        message:
          "Si l'adresse mail saisie est bien valide, vous recevrez par mail un lien pour réinitialiser votre mot de passe !",
      });
      setEmail("");
      setConfirmationEmail("");
    } catch (error) {
      setModalState({
        isOpen: true,
        title: "Erreur",
        message: "Une erreur est survenue. Veuillez réessayer plus tard.",
      });
    }
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, title: "", message: "" });
  };

  return (
    <>
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        title={modalState.title}
      >
        <p>{modalState.message}</p>
      </Modal>
      <div className="forgot-password-container">
        <h2>
          Mot de passe oublié ? <br /> Pas de panique !
        </h2>
        <p>
          Renseignez les champs ci-dessous, vous recevrez par mail un lien vous
          permettant de réinitialiser votre mot de passe.
        </p>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Adresse mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Tapez votre adresse mail"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmation-email">Confirmation adresse mail</label>
            <input
              type="email"
              id="confirmation-email"
              value={confirmationEmail}
              onChange={(e) => setConfirmationEmail(e.target.value)}
              required
              placeholder="Veuillez confirmer votre mail"
            />
          </div>
          <button type="submit" className="button-classic">
            Réinitialiser le mot de passe
          </button>
        </form>
      </div>
    </>
  );
}

export default ForgotPassword;
