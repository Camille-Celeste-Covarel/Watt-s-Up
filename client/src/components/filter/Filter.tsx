import "./filter.css";

import powerIcon from "../../assets/images/icon/power.svg";
import chademoIcon from "../../assets/images/plug/Chademo_type4.svg";
import comboCssIcon from "../../assets/images/plug/Combo-ccs.svg";
import type2Icon from "../../assets/images/plug/Type2.svg";
import efIcon from "../../assets/images/plug/ef.svg";
import filtre from "../../assets/images/topbar/filtre.svg";
import bike from "../../assets/images/vehicleIcons/bike.svg";

import { useState } from "react";

// ✅ AJOUT : Interface pour les props
interface FilterProps {
  onFilterValidation: (filters: {
    vehicles: string[];
    powers: string[];
    plugs: string[];
  }) => void;
}

// ✅ MODIFICATION : Ajouter les props
function Filter({ onFilterValidation }: FilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [selectedPlugs, setSelectedPlugs] = useState<string[]>([]);

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const toggleVehicle = (vehicleType: string) => {
    setSelectedVehicles((prev) => {
      if (prev.includes(vehicleType)) {
        return prev.filter((v) => v !== vehicleType);
      }
      return [...prev, vehicleType];
    });
  };

  const togglePower = (powerType: string) => {
    setSelectedPowers((prev) => {
      if (prev.includes(powerType)) {
        return prev.filter((p) => p !== powerType);
      }
      return [...prev, powerType];
    });
  };

  const togglePlug = (plugType: string) => {
    setSelectedPlugs((prev) => {
      if (prev.includes(plugType)) {
        return prev.filter((p) => p !== plugType);
      }
      return [...prev, plugType];
    });
  };

  // ✅ AJOUT : Fonction pour le bouton Valider
  const handleValidate = () => {
    const filters = {
      vehicles: selectedVehicles,
      powers: selectedPowers,
      plugs: selectedPlugs,
    };
    onFilterValidation(filters);
    setIsFilterOpen(false); // Ferme le filtre après validation
  };

  // ✅ AJOUT : Fonction pour réinitialiser
  const handleReset = () => {
    setSelectedVehicles([]);
    setSelectedPowers([]);
    setSelectedPlugs([]);
  };

  return (
    <div className="filter-container">
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
          <div className="vehicle-list">
            <div className="vehicle-item">
              <div className="vehicle-info">
                <img src={bike} alt="deux-roues" />
                <span>Compatibilité deux roues</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedVehicles.includes("bike")}
                  onChange={() => toggleVehicle("bike")}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          <h2>Puissance (kw)</h2>
          <div className="power-list">
            <div className="power-item">
              <div className="power-info">
                <img src={powerIcon} alt="puissance" />
                <span>Recharge Lente (moins de 7.4 kW)</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedPowers.includes("slow")}
                  onChange={() => togglePower("slow")}
                />
                <span className="slider" />
              </label>
            </div>
            <div className="power-item">
              <div className="power-info">
                <img src={powerIcon} alt="puissance" />
                <span>Recharge Accélérée (7.4 - 22.08 kW)</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedPowers.includes("accelerated")}
                  onChange={() => togglePower("accelerated")}
                />
                <span className="slider" />
              </label>
            </div>
            <div className="power-item">
              <div className="power-info">
                <img src={powerIcon} alt="puissance" />
                <span>Recharge Rapide (22.08 - 150 kW)</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedPowers.includes("fast")}
                  onChange={() => togglePower("fast")}
                />
                <span className="slider" />
              </label>
            </div>
            <div className="power-item">
              <div className="power-info">
                <img src={powerIcon} alt="puissance" />
                <span>Recharge Très Rapide (plus de 150 kW)</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedPowers.includes("ultrafast")}
                  onChange={() => togglePower("ultrafast")}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
          <h2>Type de prise</h2>
          <div className="plug-list">
            <div className="plug-item">
              <div className="plug-info">
                <img src={chademoIcon} alt="chademo" />
                <span>Chademo</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedPlugs.includes("chademo")}
                  onChange={() => togglePlug("chademo")}
                />
                <span className="slider" />
              </label>
            </div>
            <div className="plug-item">
              <div className="plug-info">
                <img src={comboCssIcon} alt="combo-css" />
                <span>Combo CSS</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedPlugs.includes("combo-css")}
                  onChange={() => togglePlug("combo-css")}
                />
                <span className="slider" />
              </label>
            </div>
            <div className="plug-item">
              <div className="plug-info">
                <img src={efIcon} alt="type-ef" />
                <span>Type EF</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedPlugs.includes("type-ef")}
                  onChange={() => togglePlug("type-ef")}
                />
                <span className="slider" />
              </label>
            </div>
            <div className="plug-item">
              <div className="plug-info">
                <img src={type2Icon} alt="type-2" />
                <span>Type 2</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedPlugs.includes("type-2")}
                  onChange={() => togglePlug("type-2")}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
          <div className="confirm-filter">
            <button type="button" onClick={handleValidate}>
              Valider
            </button>
            <button type="button" onClick={handleReset}>
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Filter;
