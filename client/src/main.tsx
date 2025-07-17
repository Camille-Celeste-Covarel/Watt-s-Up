// @ts-ignore
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Import necessary modules from React and React Router
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

/* ************************************************************************* */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Import the main app component
import App from "./App";
import { StationDetails } from "./components/StationDetails/stationDetails.tsx";
import { ImportProvider } from "./contexts/ImportContext.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ContactPage from "./pages/ContactPage";
import InfoPage from "./pages/InfoPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ProfilPage from "./pages/ProfilPage";
import RegisterPage from "./pages/RegisterPage";
import { ReservationPage } from "./pages/ReservationPage/ReservationPage";
import AdminRoute from "./utils/AdminRoute.tsx";
import ProtectedRoute from "./utils/ProtectedRoute";

/* ************************************************************************* */

// Create router configuration with routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    path: "/login",
    element: <App />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: "/register",
    element: <App />,
    children: [{ index: true, element: <RegisterPage /> }],
  },
  {
    path: "/informations",
    element: <App />,
    children: [{ index: true, element: <InfoPage /> }],
  },

  {
    path: "/profil",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ProfilPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/contact",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ContactPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/station/:id",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <StationDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/reservations",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ReservationPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "/admin/dashboard",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
    ],
  },
]);

/* ************************************************************************* */

// Find the root element in the HTML document
const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

const queryClient = new QueryClient();

// Render the app inside the root element

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
