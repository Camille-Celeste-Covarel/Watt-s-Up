import "./topbar.css";

import filtre from "../../assets/images/topbar/filtre.svg";
import logo from "../../assets/images/topbar/logo.svg";
import loupe from "../../assets/images/topbar/loupe.svg";

function TopBar() {
  return (
    <div className="topbar-container">
      <img src={logo} alt="logo" className="logo" />
      <div className="topbar-search">
        <div className="searchbar">
          <img src={loupe} alt="" className="loupe" />
        </div>
        <img src={filtre} alt="filtre" className="filtre" />
      </div>
    </div>
  );
}

export default TopBar;
