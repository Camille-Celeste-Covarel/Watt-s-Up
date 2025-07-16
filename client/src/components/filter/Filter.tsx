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

  const hasActiveFilters =
    selectedVehicles.length > 0 ||
    selectedPowers.length > 0 ||
    selectedPlugs.length > 0;

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
    setIsFilterOpen(false);
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
        className={`filtre ${hasActiveFilters ? "active-filters" : ""}`}
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
          {/* ✅ VÉHICULES */}
          <div className="vehicle-item">
            <div className="vehicle-info">
              <img src={bike} alt="" />
              <span>Compatibilité deux roues</span>
            </div>
            <label className="switch" htmlFor="vehicle-bike">
              <input
                id="vehicle-bike"
                type="checkbox"
                checked={selectedVehicles.includes("bike")}
                onChange={() => toggleVehicle("bike")}
                aria-label="Activer le filtre compatibilité deux roues"
              />
              <span className="slider" />
            </label>
          </div>

          <h2>Puissance (kw)</h2>
          <div className="power-list">
            <div className="power-item">
              <div className="power-info">
                <img src={powerIcon} alt="" />
                <span>Recharge Lente (moins de 7.4 kW)</span>
              </div>
              <label className="switch" htmlFor="power-slow">
                <input
                  id="power-slow"
                  type="checkbox"
                  checked={selectedPowers.includes("slow")}
                  onChange={() => togglePower("slow")}
                  aria-label="Activer le filtre recharge lente, moins de 7,4 kilowatt"
                />
                <span className="slider" />
              </label>
            </div>

            <div className="power-item">
              <div className="power-info">
                <img src={powerIcon} alt="" />
                <span>Recharge Accélérée (7.4 - 22.08 kW)</span>
              </div>
              <label className="switch" htmlFor="power-accelerated">
                <input
                  id="power-accelerated"
                  type="checkbox"
                  checked={selectedPowers.includes("accelerated")}
                  onChange={() => togglePower("accelerated")}
                  aria-label="Activer le filtre recharge accélérée, entre 7,4 et 22,08 kilowatt"
                />
                <span className="slider" />
              </label>
            </div>

            <div className="power-item">
              <div className="power-info">
                <img src={powerIcon} alt="" />
                <span>Recharge Rapide (22.08 - 150 kW)</span>
              </div>
              <label className="switch" htmlFor="power-fast">
                <input
                  id="power-fast"
                  type="checkbox"
                  checked={selectedPowers.includes("fast")}
                  onChange={() => togglePower("fast")}
                  aria-label="Activer le filtre recharge rapide, entre 22,08 et 150 kilowatt"
                />
                <span className="slider" />
              </label>
            </div>

            <div className="power-item">
              <div className="power-info">
                <img src={powerIcon} alt="" />
                <span>Recharge Très Rapide (plus de 150 kW)</span>
              </div>
              <label className="switch" htmlFor="power-ultrafast">
                <input
                  id="power-ultrafast"
                  type="checkbox"
                  checked={selectedPowers.includes("ultrafast")}
                  onChange={() => togglePower("ultrafast")}
                  aria-label="Activer le filtre recharge très rapide, plus de 150 kilowatt"
                />
                <span className="slider" />
              </label>
            </div>
          </div>
          <h2>Type de prise</h2>
          <div className="plug-list">
            <div className="plug-item">
              <div className="plug-info">
                <img src={chademoIcon} alt="" />
                <span>Chademo</span>
              </div>
              <label className="switch" htmlFor="plug-chademo">
                <input
                  id="plug-chademo"
                  type="checkbox"
                  checked={selectedPlugs.includes("chademo")}
                  onChange={() => togglePlug("chademo")}
                  aria-label="Activer le filtre prise Chademo"
                />
                <span className="slider" />
              </label>
            </div>

            <div className="plug-item">
              <div className="plug-info">
                <img src={comboCssIcon} alt="" />
                <span>Combo CSS</span>
              </div>
              <label className="switch" htmlFor="plug-combo-css">
                <input
                  id="plug-combo-css"
                  type="checkbox"
                  checked={selectedPlugs.includes("combo-css")}
                  onChange={() => togglePlug("combo-css")}
                  aria-label="Activer le filtre prise Combo CSS"
                />
                <span className="slider" />
              </label>
            </div>

            <div className="plug-item">
              <div className="plug-info">
                <img src={efIcon} alt="" />
                <span>Type EF</span>
              </div>
              <label className="switch" htmlFor="plug-type-ef">
                <input
                  id="plug-type-ef"
                  type="checkbox"
                  checked={selectedPlugs.includes("type-ef")}
                  onChange={() => togglePlug("type-ef")}
                  aria-label="Activer le filtre prise Type EF"
                />
                <span className="slider" />
              </label>
            </div>

            <div className="plug-item">
              <div className="plug-info">
                <img src={type2Icon} alt="" />
                <span>Type 2</span>
              </div>
              <label className="switch" htmlFor="plug-type-2">
                <input
                  id="plug-type-2"
                  type="checkbox"
                  checked={selectedPlugs.includes("type-2")}
                  onChange={() => togglePlug("type-2")}
                  aria-label="Activer le filtre prise Type 2"
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
