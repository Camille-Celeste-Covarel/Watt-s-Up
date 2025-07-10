import { useState } from "react";
import { useNavigate } from "react-router";

import "../style/loginpage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );

      if (response.ok) {
        navigate("/");
      } else {
        setError("Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error("Erreur: ", error);
      setError("Erreur de connexion");
    }
  };

  return (
    <div className="login-page-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Adresse mail</label>
          <div className="email-input">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Tapez votre adresse mail"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <div className="password-input">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tapez votre mot de passe"
            />
            <p>Mot de passe oublié ?</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="button-submit">
          Se connecter
        </button>

        <div className="separator">
          {" "}
          {/* ✅ Séparateur */}
          <h2>Toujours pas de compte ?</h2>
        </div>

        <button type="button" onClick={() => navigate("/register")}>
          S'inscrire !
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
