import { isMobile } from "react-device-detect";
// import component
import { Outlet, useMatch, useNavigate } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import { StationDetails } from "./components/stationDetails/stationDetails.tsx";
import TopBar from "./components/topbar/TopBar";

// stylesheets
import "./stylesheets/normalize.css";
import "./stylesheets/App.css";
import "./stylesheets/Overlay.css";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const stationMatch = useMatch("/station/:id");
  const navigate = useNavigate();

  const stationId = stationMatch?.params.id;

  const handleCloseStationDetails = () => {
    navigate("/");
  };

  return (
    <>
      <AuthProvider>
        <TopBar />
        <div className="main-content">
          <Outlet />

          {!isMobile && stationMatch && (
            <div
              className={`station-details-overlay ${stationMatch ? "open" : ""}`}
            >
              <button
                className="close-button"
                onClick={handleCloseStationDetails}
                type="button"
              >
                &times;
              </button>
              <StationDetails id={stationId} />
            </div>
          )}
        </div>
        <NavBar />
      </AuthProvider>
    </>
  );
}

export default App;
