import { isMobile } from "react-device-detect";
// 1. On importe useLocation pour une détection fiable du chemin
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { Overlay } from "./components/Overlay/Overlay.tsx";
import "./components/Overlay/Overlay.css";
import NavBar from "./components/navbar/NavBar";
import TopBar from "./components/topbar/TopBar";
import { AuthProvider } from "./contexts/AuthContext";
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
  // 2. On récupère la localisation actuelle
  const location = useLocation();

  const isOverlayRoute = matches.some(
    (match) => (match.handle as RouteHandle)?.isOverlay,
  );
  // 3. On corrige la détection : on vérifie si le chemin est EXACTEMENT "/"
  const isRootPath = location.pathname === "/";

  // --- LOGIQUE DE RENDU FINALE ---

  // Le contenu de l'overlay ne s'active QUE sur desktop pour les routes marquées.
  const overlayContent = !isMobile && isOverlayRoute ? <Outlet /> : null;

  // Le contenu de la page principale s'affiche si :
  //    - On est sur mobile (et pas sur la page d'accueil).
  //    - OU on est sur desktop ET ce n'est PAS une route d'overlay.
  const shouldRenderInMain = isMobile || !isOverlayRoute;
  const mainPageContent = shouldRenderInMain && !isRootPath ? <Outlet /> : null;

  return (
    <>
      <AuthProvider>
        <TopBar />
        <OverlayProvider>
          {/* La LandingPage (avec la carte) est toujours la base */}
          <LandingPage />

          {/* Ce conteneur affichera les pages "plein écran" */}
          {mainPageContent && (
            <div className="main-page-container">{mainPageContent}</div>
          )}

          <NavBar />

          {/* L'overlay ne recevra du contenu que sur desktop */}
          <Overlay>{overlayContent}</Overlay>
        </OverlayProvider>
      </AuthProvider>
    </>
  );
}

export default App;
