import "./normalize.css";
import "./App.css";
import NavBar from "./components/navbar/NavBar";
import SearchBar from "./components/searchbar/SearchBar";
import TopBar from "./components/topbar/TopBar";

function App() {
  return (
    <>
      <TopBar />
      <SearchBar />
      <NavBar />
    </>
  );
}

export default App;
