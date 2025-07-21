import { isMobile } from "react-device-detect";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/topbar/logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import { ProfileDropdown } from "./ProfileDropdown";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const renderDesktopNav = () => (
    <div className="desktop-nav-container">
      <nav className="desktop-nav-links">
        <Link to="/">Carte</Link>
        <Link to="/reservations">Mes réservations</Link>
        <Link to="/contact">Assistance</Link>
        <Link to="/informations">Informations</Link>
        {isAdmin && <Link to="/admin/dashboard">Dashboard Admin</Link>}
      </nav>
      <ProfileDropdown />
    </div>
  );

  const renderMobileNav = () => <ProfileDropdown />;

  return (
    <header className="topbar-container">
      <button
        type="button"
        className="logo-button"
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="logo" className="logo" />
      </button>

      {isMobile ? renderMobileNav() : renderDesktopNav()}
    </header>
  );
}

export default Header;
