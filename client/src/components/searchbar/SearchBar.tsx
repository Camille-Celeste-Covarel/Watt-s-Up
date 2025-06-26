import "./searchbar.css";

import filtre from "../../assets/images/topbar/filtre.svg";
import loupe from "../../assets/images/topbar/loupe.svg";

function SearchBar() {
  return (
    <div className="topbar-search">
      <div className="searchbar">
        <img src={loupe} alt="" className="loupe" />
        <input
          type="text"
          placeholder="Rechercher une borne..."
          className="search-input"
        />
      </div>
      <img src={filtre} alt="filtre" className="filtre" />
    </div>
  );
}

export default SearchBar;
