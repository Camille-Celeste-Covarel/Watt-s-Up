import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// @ts-ignore
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App";
import { StationDetails } from "./components/StationDetails/stationDetails.tsx";
import { ImportProvider } from "./contexts/ImportContext.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ContactPage from "./pages/ContactPage";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import InfoPage from "./pages/InfoPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ProfilPage from "./pages/ProfilPage";
import RegisterPage from "./pages/RegisterPage";
import { ReservationPage } from "./pages/ReservationPage/ReservationPage";
import ResetPassword from "./pages/ResetPassword.tsx";
import AdminRoute from "./utils/AdminRoute.tsx";
import ProtectedRoute from "./utils/ProtectedRoute";

// Voici la nouvelle structure de routes, avec <App /> comme racine unique.
const router = createBrowserRouter([
  {
    element: <App />, // App est le parent de TOUTES les pages
    children: [
      // --- Routes qui s'affichent toujours en pleine page ---
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/informations",
        element: <InfoPage />,
      },
      {
        path: "/reservations",
        element: (
          <ProtectedRoute>
            <ReservationPage />
          </ProtectedRoute>
        ),
        handle: { isOverlay: true },
      },
      {
        path: "/admin/dashboard",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
        handle: { isOverlay: true },
      },

      // --- Routes qui doivent s'ouvrir dans l'overlay sur Desktop ---
      // On ajoute la propriété `handle` pour les identifier.
      {
        path: "/station/:id",
        element: (
          <ProtectedRoute>
            <StationDetails />
          </ProtectedRoute>
        ),
        handle: { isOverlay: true },
      },
      {
        path: "/profil",
        element: (
          <ProtectedRoute>
            <ProfilPage />
          </ProtectedRoute>
        ),
        handle: { isOverlay: true },
      },
      {
        path: "/contact",
        element: (
          <ProtectedRoute>
            <ContactPage />
          </ProtectedRoute>
        ),
        handle: { isOverlay: true },
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

const queryClient = new QueryClient();

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ImportProvider>
        <RouterProvider router={router} />
      </ImportProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </StrictMode>,
);
