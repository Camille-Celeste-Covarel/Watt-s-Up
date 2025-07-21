import "./Footer.css";

import { isMobile } from "react-device-detect";
import { FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router";
import borne from "../../assets/images/navbar/borne.svg";
import contact from "../../assets/images/navbar/contact.svg";
import info from "../../assets/images/navbar/info.svg";
import reservation from "../../assets/images/navbar/reservation.svg";
import { useAuth } from "../../contexts/AuthContext";

function Footer() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <div className="navbar-container">
      {isMobile && (
        <>
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
            <img src={reservation} alt="Mes réservations" />
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
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              title="Administration"
            >
              <FaUserShield size={35} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default Footer;
