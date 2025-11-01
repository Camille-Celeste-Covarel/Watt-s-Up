import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// @ts-ignore
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App";
import { StationDetails } from "./components/StationDetails/stationDetails.tsx";
import Filter from "./components/filter/Filter.tsx";
import { ImportProvider } from "./contexts/ImportContext.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ContactPage from "./pages/ContactPage";
import EditProfilPage from "./pages/EditProfilPage.tsx";
import EditVehiclePage from "./pages/EditVehiclePage.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import InfoPage from "./pages/InfoPage";
import LandingPage from "./pages/LandingPage.tsx";
import LoginPage from "./pages/LoginPage";
import ProfilPage from "./pages/ProfilPage";
import RegisterPage from "./pages/RegisterPage";
import { ReservationPage } from "./pages/ReservationPage/ReservationPage";
import ReservationSuccessPage from "./pages/ReservationPage/ReservationSuccessPage.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AdminRoute from "./utils/AdminRoute.tsx";
import ProtectedRoute from "./utils/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
        handle: { isOverlay: true },
      },
      {
        path: "/register",
        element: <RegisterPage />,
        handle: { isOverlay: true },
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
        handle: { isOverlay: true },
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
        handle: { isOverlay: true },
      },
      {
        path: "/informations",
        element: <InfoPage />,
        handle: { isOverlay: true },
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
        path: "/reservation/success/:reservationId",
        element: (
          <ProtectedRoute>
            <ReservationSuccessPage />
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
        path: "/profil/edit",
        element: (
          <ProtectedRoute>
            <EditProfilPage />
          </ProtectedRoute>
        ),
        handle: { isOverlay: true },
      },
      {
        path: "/vehicle/edit",
        element: (
          <ProtectedRoute>
            <EditVehiclePage />
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
      {
        path: "/filtres",
        element: <Filter />,
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
