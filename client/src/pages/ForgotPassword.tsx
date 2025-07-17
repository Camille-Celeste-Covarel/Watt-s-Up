import { useState } from "react";

import "../style/forgotpassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState<string>("");
    const [confirmationEmail, setConfirmationEmail] = useState<string>("");
    const [infoMessage, setInfoMessage] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmationEmail !== email) {
            setInfoMessage("Les adresses mail ne correspondent pas.");
            return;
        }

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            setInfoMessage(
                "Si l'adresse mail saisie est bien valide, vous recevrez par mail un lien pour réinitialiser votre mot de passe !",
            );
            setEmail("");
            setConfirmationEmail("");
        } catch (error) {
            setInfoMessage("Une erreur est survenue. Veuillez réessayer plus tard.");
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>
                Mot de passe oublié ? <br /> Pas de panique !
            </h2>
            <p>
                Renseignez les champs ci-dessous, vous recevrez par mail un lien vous
                permettant de réinitialiser votre mot de passe.
            </p>
            <form onSubmit={handleSubmit} className="forgot-password-form">
                <label htmlFor="email">Adresse mail</label>
                <div>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Tapez votre adresse mail"
                    />
                </div>
                <label htmlFor="confirmation-email">Confirmation adresse mail</label>
                <div>
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
            {infoMessage && <div className="info-message">{infoMessage}</div>}
        </div>
    );
}

export default ForgotPassword;
