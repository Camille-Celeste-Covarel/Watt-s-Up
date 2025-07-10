import "./topbar.css";
import { useNavigate } from "react-router";

import logo from "../../assets/images/topbar/logo.svg";

function TopBar() {
  const navigate = useNavigate();
  return (
    <div className="topbar-container">
      <button
        type="button"
        onClick={() => {
          navigate("/");
        }}
      >
        <img src={logo} alt="logo" className="logo" />
      </button>
    </div>
  );
}

export default TopBar;
