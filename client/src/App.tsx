import { isMobile } from "react-device-detect";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { Overlay } from "./components/Overlay/Overlay.tsx";
import "./components/Overlay/Overlay.css";
import Footer from "./components/Footer/Footer.tsx";
import Header from "./components/Header/Header.tsx";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton.tsx";
import ToastContainer from "./components/Toast/ToastContainer";
import { AuthProvider } from "./contexts/AuthContext";
import { FilterProvider } from "./contexts/FilterContext.tsx";
import { OverlayProvider } from "./contexts/OverlayContext/OverlayContext.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import type { RouteHandle } from "./types/components/componentsTypes.ts";

// stylesheets
import "./stylesheets/App.css";
import "./stylesheets/normalize.css";

function AppContent() {
  const matches = useMatches();
  const location = useLocation();

  const isOverlayRoute = matches.some(
    (match) => (match.handle as RouteHandle)?.isOverlay,
  );
  const isRootPath = location.pathname === "/";

  // --- Logique d'affichage ---
  const shouldShowOverlay = !isMobile && isOverlayRoute;
  const shouldShowFullPage = !isRootPath && !isOverlayRoute;
  const shouldShowMobilePage = isMobile && !isRootPath;

  const routeContent = <Outlet />;

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {shouldShowOverlay && <Overlay title="">{routeContent}</Overlay>}

        <LandingPage />
      </main>
      {(shouldShowFullPage || shouldShowMobilePage) && (
        <div className="main-page-container">{routeContent}</div>
      )}
      <Footer />
      <ToastContainer />
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <OverlayProvider>
        <FilterProvider>
          <AppContent />
        </FilterProvider>
      </OverlayProvider>
    </AuthProvider>
  );
}

export default App;
