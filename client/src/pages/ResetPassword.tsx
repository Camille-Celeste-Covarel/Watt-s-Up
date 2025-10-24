import { useState } from "react";
import { useLocation } from "react-router-dom";

function ResetPassword() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const [password, setPassword] = useState<string>("");
  const [confirmationPassword, setConfirmationPassword] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationPassword !== password) {
      setInfoMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!token) {
      setInfoMessage("Lien invalide ou expiré.");
      return;
    }
    if (password.length < 6) {
      setInfoMessage("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );
      const data = await response.json();
      setInfoMessage(data.message);
      setPassword("");
      setConfirmationPassword("");
    } catch (error) {
      setInfoMessage("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Réinitialisation de votre mot de passe</h2>
      <p>Merci de choisir ci-dessous un nouveau mot de passe</p>
      <form onSubmit={handleSubmit} className="reset-password-form">
        <div>
          <label htmlFor="password">
            Choisissez votre nouveau mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nouveau mot de passe"
          />
        </div>
        <div>
          <label htmlFor="confirmation-password">
            Confirmez votre nouveau mot de passe
          </label>
          <input
            type="password"
            id="confirmation-password"
            value={confirmationPassword}
            onChange={(e) => setConfirmationPassword(e.target.value)}
            required
            placeholder="Nouveau mot de passe"
          />
        </div>
        <button type="submit" className="button-classic">
          Réinitialisez le mot de passe
        </button>
      </form>
      {infoMessage && <div className="info-message">{infoMessage}</div>}
    </div>
  );
}

export default ResetPassword;
