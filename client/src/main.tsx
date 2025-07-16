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
import ContactPage from "./pages/ContactPage";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import InfoPage from "./pages/InfoPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ProfilPage from "./pages/ProfilPage.tsx";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./utils/ProtectedRoute.tsx";

// Import additional components for new routes
// Try creating these components in the "pages" folder

// import About from "./pages/About";
// import Contact from "./pages/Contact";

/* ************************************************************************* */

// Create router configuration with routes
// You can add more routes as you build out your app!
const router = createBrowserRouter([
  // ✅ ROUTES PUBLIQUES (inchangées)
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
    path: "/forgot-password",
    element: <App />,
    children: [{ index: true, element: <ForgotPassword /> }],
  },
  {
    path: "/informations",
    element: <App />,
    children: [{ index: true, element: <InfoPage /> }],
  },

  // ✅ ROUTES PROTÉGÉES (avec ProtectedRoute)
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
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);

/**
 * Helpful Notes:
 *
 * 1. Adding More Routes:
 *    To add more pages to your app, first create a new component (e.g., About.tsx).
 *    Then, import that component above like this:
 *
 *    import About from "./pages/About";
 *
 *    Add a new route to the router:
 *
 *      {
 *        path: "/about",
 *        element: <About />,  // Renders the About component
 *      }
 *
 * 2. Try Nested Routes:
 *    For more complex applications, you can nest routes. This lets you have sub-pages within a main page.
 *    Documentation: https://reactrouter.com/en/main/start/tutorial#nested-routes
 *
 * 3. Experiment with Dynamic Routes:
 *    You can create routes that take parameters (e.g., /users/:id).
 *    Documentation: https://reactrouter.com/en/main/start/tutorial#url-params-in-loaders
 */
