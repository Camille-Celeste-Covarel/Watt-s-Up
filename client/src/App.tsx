import * as DeviceDetect from "react-device-detect";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { Overlay } from "./components/Overlay/Overlay.tsx";
import MapLibre from "./components/map/MapLibre.tsx"; // ✅ 1. Importer MapLibre directement
import NavBar from "./components/navbar/NavBar";
import TopBar from "./components/topbar/TopBar";
import { AuthProvider } from "./contexts/AuthContext";
import { FilterProvider } from "./contexts/FilterContext.tsx";
import { OverlayProvider } from "./contexts/OverlayContext/OverlayContext.tsx";

// stylesheets
import "./stylesheets/App.css";
import "./stylesheets/normalize.css";
import type React from "react";

interface RouteHandle {
  isOverlay?: boolean;
}

function App() {
  const matches = useMatches();
  const location = useLocation();

  const isOverlayRoute = matches.some(
    (match) => (match.handle as RouteHandle)?.isOverlay,
  );
  const isRootPath = location.pathname === "/";

  // --- LOGIQUE DE RENDU ---

  let overlayContent: React.ReactNode = null;
  let mainPageContent: React.ReactNode = null;

  if (isOverlayRoute && !DeviceDetect.isMobile) {
    overlayContent = <Outlet />;
  } else if (!isRootPath && DeviceDetect.isMobile) {
    mainPageContent = <Outlet />;
  }

  return (
    <>
      <AuthProvider>
        <OverlayProvider>
          <FilterProvider>
            <div className="app-container">
              <TopBar />

              <main className="main-content-area">
                {/* La carte est maintenant l'élément de fond permanent */}
                <div className="map-container">
                  {/* ✅ 2. On affiche la carte directement, pas la LandingPage */}
                  <MapLibre />
                </div>

                {/*
                  L'overlay vient se superposer à côté de la carte.
                  Son contenu est fourni par le routeur via l'Outlet.
                */}
                {overlayContent && <Overlay>{overlayContent}</Overlay>}
              </main>

              {/*
                Ce conteneur pour les pages "pleine page" sur mobile
                ne sera rendu QUE si mainPageContent n'est pas null.
              */}
              {mainPageContent && (
                <div className="main-page-container">{mainPageContent}</div>
              )}

              <NavBar />
            </div>
          </FilterProvider>
        </OverlayProvider>
      </AuthProvider>
    </>
  );
}

export default App;
