import { isMobile } from "react-device-detect";
import { Outlet, useMatches } from "react-router-dom";
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

  const isOverlayRoute = matches.some(
    (match) => (match.handle as RouteHandle)?.isOverlay,
  );

  // NOUVELLE LOGIQUE DE RENDU
  // On sépare le contenu de l'outlet (la page actuelle) du reste.
  const outletContent = <Outlet />;

  // Si la route est une route d'overlay, son contenu va dans l'overlay.
  const overlayContent = !isMobile && isOverlayRoute ? outletContent : null;

  // Si la route n'est PAS une route d'overlay, son contenu est une "page principale".
  // Pour la page d'accueil (`/`), l'outlet rend LandingPage, mais on ne veut pas l'afficher
  // deux fois. On vérifie donc si le chemin est la racine.
  const isRootPath = matches.some((match) => match.pathname === "/");
  const mainPageContent = !isOverlayRoute && !isRootPath ? outletContent : null;

  return (
    <>
      <AuthProvider>
        <TopBar />
        <OverlayProvider>
          {/* La LandingPage (avec la carte) est maintenant TOUJOURS rendue.
              Elle ne sera plus jamais détruite/rechargée. */}
          <LandingPage />

          {/* Ce conteneur affichera les pages "plein écran" (ex: /login) */}
          {mainPageContent && (
            <div className="main-page-container">{mainPageContent}</div>
          )}

          <NavBar />

          {/* L'overlay reçoit le contenu des routes marquées comme overlay */}
          <Overlay>{overlayContent}</Overlay>
        </OverlayProvider>
      </AuthProvider>
    </>
  );
}

export default App;
