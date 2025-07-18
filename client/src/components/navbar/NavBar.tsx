import "./navbar.css";

import { FaUserShield } from "react-icons/fa"; // Importer l'icône d'administration de react-icons
import { useNavigate } from "react-router";
import borne from "../../assets/images/navbar/borne.svg";
import contact from "../../assets/images/navbar/contact.svg";
import info from "../../assets/images/navbar/info.svg";
import profil from "../../assets/images/navbar/profil.svg";
import reservation from "../../assets/images/navbar/reservation.svg";
import { useAuth } from "../../contexts/AuthContext";

function NavBar() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth(); // Récupérer le statut admin

  return (
    <div className="navbar-container">
      <button
        type="button"
        onClick={() => {
          navigate("/reservations");
        }}
      >
        <img src={borne} alt="borne" />
      </button>
      <img src={reservation} alt="reserver une borne" />
      <button type="button" onClick={() => navigate("/profil")}>
        <img src={profil} alt="votre profil" />
      </button>
      <button
        type="button"
        onClick={() => {
          navigate("/contact");
        }}
      >
        <img src={contact} alt="nous contacter" />
      </button>
      <button
        type="button"
        onClick={() => {
          navigate("/informations");
        }}
      >
        <img src={info} alt="informations" />
      </button>
      {/* Affiche le bouton uniquement si l'utilisateur est admin */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          title="Administration"
        >
          <FaUserShield size={35} /> {/* Utiliser l'icône de react-icons */}
        </button>
      )}
    </div>
  );
}

export default NavBar;
