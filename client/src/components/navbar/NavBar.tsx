import "./navbar.css";

import { FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router";
import borne from "../../assets/images/navbar/borne.svg";
import contact from "../../assets/images/navbar/contact.svg";
import info from "../../assets/images/navbar/info.svg";
import profil from "../../assets/images/navbar/profil.svg";
import reservation from "../../assets/images/navbar/reservation.svg";
import { useAuth } from "../../contexts/AuthContext";

function NavBar() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <div className="navbar-container">
      <button
        type="button"
        onClick={() => {
          navigate("/");
        }}
      >
        <img src={borne} alt="Carte" />
      </button>

      <button
        type="button"
        onClick={() => {
          navigate("/reservations");
        }}
      >
        <img src={reservation} alt="Réserver une borne" />
      </button>

      <button type="button" onClick={() => navigate("/profil")}>
        <img src={profil} alt="Votre profil" />
      </button>
      <button
        type="button"
        onClick={() => {
          navigate("/contact");
        }}
      >
        <img src={contact} alt="Nous contacter" />
      </button>
      <button
        type="button"
        onClick={() => {
          navigate("/informations");
        }}
      >
        <img src={info} alt="Informations" />
      </button>
      {/* Affiche le bouton uniquement si l'utilisateur est admin */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          title="Administration"
        >
          <FaUserShield size={35} />
        </button>
      )}
    </div>
  );
}

export default NavBar;
