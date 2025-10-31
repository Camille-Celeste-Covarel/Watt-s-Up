import { useState } from "react";
import type { FormEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext.tsx";
import "../stylesheets/loginpage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
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
        const data = await response.json();
        login(data.user);
        navigate("/");
      } else {
        setError("Email ou mot de passe incorrect");
      }
    } catch (err) {
      console.error("Erreur: ", err);
      setError("Erreur de connexion");
    }
  };

  return (
    <div className="login-page-container">
      <form onSubmit={handleSubmit} className="login-form">
        {error && (
          <div id="login-error" role="alert" className="error-message">
            {error}
          </div>
        )}
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
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tapez votre mot de passe"
              aria-describedby={error ? "login-error" : undefined}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button
            type="button"
            className="login-forgot-password"
            onClick={() => {
              navigate("/forgot-password");
            }}
          >
            Mot de passe oublié ?
          </button>
        </div>

        <div className="login_button">
          <button type="submit" className="button-classic">
            Se connecter
          </button>

          <button
            type="button"
            className="button-classic"
            onClick={() => navigate("/register")}
          >
            S'inscrire
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
