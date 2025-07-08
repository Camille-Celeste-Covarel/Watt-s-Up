import "./navbar.css";

import { useNavigate } from "react-router";
import borne from "../../assets/images/navbar/borne.svg";
import contact from "../../assets/images/navbar/contact.svg";
import info from "../../assets/images/navbar/info.svg";
import profil from "../../assets/images/navbar/profil.svg";
import reservation from "../../assets/images/navbar/reservation.svg";

function NavBar() {
  const navigate = useNavigate();

  return (
    <div className="navbar-container">
      <button
        type="button"
        onClick={() => {
          navigate("/");
        }}
      >
        <img src={borne} alt="borne" />
      </button>
      <img src={reservation} alt="reserver une borne" />
      <button type="button" onClick={() => navigate("/login")}>
        <img src={profil} alt="votre profil" />
      </button>
      <img src={contact} alt="nous contacter" />
      <img src={info} alt="informations" />
    </div>
  );
}

export default NavBar;
