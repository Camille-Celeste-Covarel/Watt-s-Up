import { isMobile } from "react-device-detect";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { Overlay } from "./components/Overlay/Overlay.tsx";
import "./components/Overlay/Overlay.css";
import NavBar from "./components/navbar/NavBar";
import TopBar from "./components/topbar/TopBar";
import { AuthProvider } from "./contexts/AuthContext";
import { FilterProvider } from "./contexts/FilterContext.tsx";
import {
  OverlayProvider,
  useOverlay,
} from "./contexts/OverlayContext/OverlayContext.tsx";
import LandingPage from "./pages/LandingPage.tsx";

// stylesheets
import "./stylesheets/App.css";
import "./stylesheets/normalize.css";

interface RouteHandle {
  isOverlay?: boolean;
}

function AppContent() {
  const { isOverlayOpen } = useOverlay();
  const matches = useMatches();
  const location = useLocation();

  const isOverlayRoute = matches.some(
    (match) => (match.handle as RouteHandle)?.isOverlay,
  );
  const isRootPath = location.pathname === "/";

  const overlayContent = !isMobile && isOverlayRoute ? <Outlet /> : null;
  const shouldRenderInMain = isMobile || !isOverlayRoute;
  const mainPageContent = shouldRenderInMain && !isRootPath ? <Outlet /> : null;

  return (
    <div className="app-container">
      <TopBar />
      <main className="main-content">
        <LandingPage />
        {isOverlayOpen && <Overlay title="">{overlayContent}</Overlay>}
      </main>
      {mainPageContent && (
        <div className="main-page-container">{mainPageContent}</div>
      )}
      <NavBar />
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
