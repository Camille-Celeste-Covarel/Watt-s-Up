import { isMobile } from "react-device-detect";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { Overlay } from "./components/Overlay/Overlay.tsx";
import NavBar from "./components/navbar/NavBar";
import TopBar from "./components/topbar/TopBar";
import { AuthProvider } from "./contexts/AuthContext";
import { FilterProvider } from "./contexts/FilterContext.tsx"; // ✅ 1. Importer le FilterProvider
import { OverlayProvider } from "./contexts/OverlayContext/OverlayContext.tsx";
import LandingPage from "./pages/LandingPage.tsx";

// stylesheets
import "./stylesheets/App.css";
import "./stylesheets/normalize.css";

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

  // --- NOUVELLE LOGIQUE DE RENDU ---

  // Le contenu de l'overlay est conditionnel : uniquement sur desktop et si c'est une route d'overlay.
  const overlayContent = !isMobile && isOverlayRoute ? <Outlet /> : null;

  // Le contenu de la page principale (pour mobile)
  const mainPageContent = isMobile && !isRootPath ? <Outlet /> : null;

  return (
    <>
      <AuthProvider>
        <OverlayProvider>
          {/* ✅ 2. On enveloppe l'application avec le FilterProvider */}
          <FilterProvider>
            <div className="app-container">
              <TopBar />

              <main className="main-content-area">
                {/* La LandingPage (carte) est toujours visible sur desktop */}
                <div className="map-container">
                  <LandingPage />
                </div>

                {/*
                L'overlay est maintenant un frère de la carte.
                Il n'est rendu que si nécessaire.
              */}
                {overlayContent && <Overlay>{overlayContent}</Overlay>}
              </main>

              {/* Ce conteneur est pour les pages "pleine page" sur mobile */}
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
