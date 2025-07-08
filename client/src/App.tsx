import "./normalize.css";
import "./App.css";
import { Outlet } from "react-router";
import NavBar from "./components/navbar/NavBar";
import TopBar from "./components/topbar/TopBar";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <>
      <AuthProvider>
        <TopBar />
        <Outlet />
        <NavBar />
      </AuthProvider>
    </>
  );
}

export default App;
