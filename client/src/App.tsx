import "./normalize.css";
import "./App.css";
import { Outlet } from "react-router";
import NavBar from "./components/navbar/NavBar";
import TopBar from "./components/topbar/TopBar";

function App() {
  return (
    <>
      <TopBar />
      <Outlet />
      <NavBar />
    </>
  );
}

export default App;
