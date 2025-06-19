import "./navbar.css";

import borne from "../../assets/images/navbar/borne.svg";
import contact from "../../assets/images/navbar/contact.svg";
import info from "../../assets/images/navbar/info.svg";
import profil from "../../assets/images/navbar/profil.svg";
import reservation from "../../assets/images/navbar/reservation.svg";

function NavBar() {
  return (
    <div className="navbar-container">
      <img src={borne} alt="borne" />
      <img src={reservation} alt="reserver une borne" />
      <img src={profil} alt="votre profil" />
      <img src={contact} alt="nous contacter" />
      <img src={info} alt="informations" />
    </div>
  );
}

export default NavBar;
