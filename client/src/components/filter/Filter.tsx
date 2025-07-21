import "./filter.css";

import powerIcon from "../../assets/images/icon/power.svg";
import chademoIcon from "../../assets/images/plug/Chademo_type4.svg";
import comboCssIcon from "../../assets/images/plug/Combo-ccs.svg";
import type2Icon from "../../assets/images/plug/Type2.svg";
import efIcon from "../../assets/images/plug/ef.svg";
import bike from "../../assets/images/vehicleIcons/bike.svg";
import { useFilters } from "../../contexts/FilterContext.tsx";
import type { FilterState } from "../../contexts/FilterContext.tsx";

// --- Données pour les filtres ---
const powerOptions = [
  { id: "slow", label: "Recharge Lente (moins de 7.4 kW)" },
  { id: "accelerated", label: "Recharge Accélérée (7.4 - 22.08 kW)" },
  { id: "fast", label: "Recharge Rapide (22.08 - 150 kW)" },
  { id: "ultrafast", label: "Recharge Très Rapide (plus de 150 kW)" },
];

const plugOptions = [
  { id: "chademo", label: "Chademo", icon: chademoIcon },
  { id: "combo-css", label: "Combo CSS", icon: comboCssIcon },
  { id: "type-ef", label: "Type EF", icon: efIcon },
  { id: "type-2", label: "Type 2", icon: type2Icon },
];

function Filter() {
  // On récupère l'état et les fonctions du contexte
  const { filters, setFilters } = useFilters();

  // ✅ Fonction de bascule générique pour éviter la répétition
  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const handleReset = () => {
    setFilters({
      vehicles: [],
      powers: [],
      plugs: [],
    });
  };

  return (
    <div className="filter-panel-content">
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
            checked={filters.vehicles.includes("bike")}
            onChange={() => toggleFilter("vehicles", "bike")}
            aria-label="Activer le filtre compatibilité deux roues"
          />
          <span className="slider" />
        </label>
      </div>

      <h2>Puissance (kw)</h2>
      <div className="power-list">
        {powerOptions.map((option) => (
          <div className="power-item" key={option.id}>
            <div className="power-info">
              <img src={powerIcon} alt="" />
              <span>{option.label}</span>
            </div>
            <label className="switch" htmlFor={`power-${option.id}`}>
              <input
                id={`power-${option.id}`}
                type="checkbox"
                checked={filters.powers.includes(option.id)}
                onChange={() => toggleFilter("powers", option.id)}
                aria-label={`Activer le filtre ${option.label}`}
              />
              <span className="slider" />
            </label>
          </div>
        ))}
      </div>

      <h2>Type de prise</h2>
      <div className="plug-list">
        {plugOptions.map((option) => (
          <div className="plug-item" key={option.id}>
            <div className="plug-info">
              <img src={option.icon} alt="" />
              <span>{option.label}</span>
            </div>
            <label className="switch" htmlFor={`plug-${option.id}`}>
              <input
                id={`plug-${option.id}`}
                type="checkbox"
                checked={filters.plugs.includes(option.id)}
                onChange={() => toggleFilter("plugs", option.id)}
                aria-label={`Activer le filtre prise ${option.label}`}
              />
              <span className="slider" />
            </label>
          </div>
        ))}
      </div>

      <div className="confirm-filter">
        <button type="button" className="button-classic" onClick={handleReset}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

export default Filter;
