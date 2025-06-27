import "./searchbar.css";

import filtre from "../../assets/images/topbar/filtre.svg";
import loupe from "../../assets/images/topbar/loupe.svg";
import bike from "../../assets/images/vehicleIcons/bike.svg";
import car from "../../assets/images/vehicleIcons/car.svg";
import truck from "../../assets/images/vehicleIcons/truck.svg";

import { useState } from "react";

function SearchBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

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
      <img
        src={filtre}
        alt="filtre"
        className="filtre"
        onClick={toggleFilter}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleFilter();
          }
        }}
      />
      {isFilterOpen && (
        <div className="filter-overlay">
          <h2>Compatibilité véhicule</h2>
          <select>
            <option value="aucun">Aucune</option>
            <option value="premierVehicule">1er véhicule</option>
            <option value="deuxiemeVehicule">2ème véhicule</option>
          </select>
          <h2>Type de véhicules</h2>
          <div className="vehicle-icons">
            <button type="button">
              <img src={bike} alt="deux-roues" />
            </button>
            <button type="button">
              <img src={car} alt="voiture" />
            </button>
            <button type="button">
              <img src={truck} alt="camion" />
            </button>
          </div>
          <h2>Puissance (kw)</h2>
          <div className="power-icons">power icons</div>
          <h2>type de prise</h2>
          <div className="plug-icons">plug icons</div>
          <div className="confirm-filter">
            <button type="button">Valider</button>
            <button type="button">Réinitialiser</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
