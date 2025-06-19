import "./topbar.css";

import logo from "../../assets/images/topbar/logo.svg";

function TopBar() {
  return (
    <div className="topbar-container">
      <img src={logo} alt="logo" className="logo" />
    </div>
  );
}

export default TopBar;
