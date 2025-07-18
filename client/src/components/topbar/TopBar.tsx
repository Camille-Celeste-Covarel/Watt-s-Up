import "./topbar.css";
import { useNavigate } from "react-router";
import logo from "../../assets/images/topbar/logo.svg";
// ✅ 3. On retire l'import de l'icône de filtre
// import filtreIcon from "../../assets/images/topbar/filtre.svg";

import { useAuth } from "../../contexts/AuthContext";

function TopBar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="topbar-container">
      <button
        type="button"
        className="logo-button"
        onClick={() => {
          navigate("/");
        }}
      >
        <img src={logo} alt="logo" className="logo" />
      </button>

      {!isAuthenticated ? (
        <button
          type="button"
          className="login-button"
          onClick={() => {
            navigate("/login");
          }}
        >
          Se connecter
        </button>
      ) : (
        <button type="button" className="logout-button" onClick={handleLogout}>
          Se déconnecter
        </button>
      )}
    </div>
  );
}

export default TopBar;
