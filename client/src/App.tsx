import { isMobile } from "react-device-detect";
// import component
import { Outlet } from "react-router-dom";
import { Overlay } from "./components/Overlay/Overlay.tsx";
import NavBar from "./components/navbar/NavBar";
import TopBar from "./components/topbar/TopBar";
import { OverlayProvider } from "./contexts/OverlayContext/OverlayContext.tsx";

// stylesheets
import "./stylesheets/normalize.css";
import "./stylesheets/App.css";
import "./stylesheets/Overlay.css";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <>
      <AuthProvider>
        <TopBar />
        <OverlayProvider>
          <Outlet />
          <NavBar />

          {!isMobile && <Overlay />}
        </OverlayProvider>
      </AuthProvider>
    </>
  );
}

export default App;
