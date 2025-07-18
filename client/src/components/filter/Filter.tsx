import "./filter.css";

import powerIcon from "../../assets/images/icon/power.svg";
import chademoIcon from "../../assets/images/plug/Chademo_type4.svg";
import comboCssIcon from "../../assets/images/plug/Combo-ccs.svg";
import type2Icon from "../../assets/images/plug/Type2.svg";
import efIcon from "../../assets/images/plug/ef.svg";
import bike from "../../assets/images/vehicleIcons/bike.svg";

import { useState } from "react";
import { useFilter } from "../../contexts/FilterContext.tsx"; // ✅ 1. Importer le hook
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";

function Filter() {
  const { closeOverlay } = useOverlay();
  // ✅ 2. Récupérer l'état actuel et la fonction de mise à jour du contexte
  const { filters: globalFilters, setFilters } = useFilter();

  // Initialiser l'état local avec les filtres globaux actuels
  // pour que le panneau se souvienne des choix précédents.
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(
    globalFilters.vehicles,
  );
  const [selectedPowers, setSelectedPowers] = useState<string[]>(
    globalFilters.powers,
  );
  const [selectedPlugs, setSelectedPlugs] = useState<string[]>(
    globalFilters.plugs,
  );

  // La logique de bascule des filtres reste la même
  const toggleVehicle = (vehicleType: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleType)
        ? prev.filter((v) => v !== vehicleType)
        : [...prev, vehicleType],
    );
  };

  const togglePower = (powerType: string) => {
    setSelectedPowers((prev) =>
      prev.includes(powerType)
        ? prev.filter((p) => p !== powerType)
        : [...prev, powerType],
    );
  };

  const togglePlug = (plugType: string) => {
    setSelectedPlugs((prev) =>
      prev.includes(plugType)
        ? prev.filter((p) => p !== plugType)
        : [...prev, plugType],
    );
  };

  const handleValidate = () => {
    const newFilters = {
      vehicles: selectedVehicles,
      powers: selectedPowers,
      plugs: selectedPlugs,
    };
    // ✅ 3. Mettre à jour le contexte global avec les nouveaux filtres
    setFilters(newFilters);
    closeOverlay(); // On ferme l'overlay après validation
  };

  const handleReset = () => {
    // Réinitialiser l'état local
    setSelectedVehicles([]);
    setSelectedPowers([]);
    setSelectedPlugs([]);
    // ✅ 4. Réinitialiser également le contexte global
    setFilters({ vehicles: [], powers: [], plugs: [] });
  };

  return (
    <div className="filter-content">
      <h2>Compatibilité véhicule</h2>
      <select>
        <option value="aucun">Aucune</option>
        <option value="premierVehicule">1er véhicule</option>
        <option value="deuxiemeVehicule">2ème véhicule</option>
      </select>

      <h2>Type de véhicules</h2>
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
        <button
          type="button"
          className="button-classic"
          onClick={handleValidate}
        >
          Valider
        </button>
        <button type="button" className="button-classic" onClick={handleReset}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

export default Filter;
