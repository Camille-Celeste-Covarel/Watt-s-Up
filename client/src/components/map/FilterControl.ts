import type { IControl, Map as MapLibreMap } from "maplibre-gl";
import filtreIcon from "../../assets/images/topbar/filtre.svg";

export class FilterControl implements IControl {
  private controlContainer: HTMLElement | undefined;
  private readonly options: { onClick: () => void };

  constructor(options: { onClick: () => void }) {
    this.options = options;
  }

  onAdd(_map: MapLibreMap): HTMLElement {
    this.controlContainer = document.createElement("div");
    // ✅ MODIFICATION : On donne une classe unique et descriptive au conteneur
    this.controlContainer.className =
      "maplibregl-ctrl map-filter-control-container";

    const button = document.createElement("button");
    // On garde une classe générique pour le bouton, le style viendra du parent
    button.className = "maplibregl-ctrl-icon";
    button.type = "button";
    button.setAttribute("aria-label", "Ouvrir les filtres");
    button.onclick = this.options.onClick;

    const icon = document.createElement("img");
    icon.src = filtreIcon;
    icon.alt = "Filtres";
    icon.style.width = "20px";
    icon.style.height = "20px";

    button.appendChild(icon);
    this.controlContainer.appendChild(button);

    return this.controlContainer;
  }

  onRemove(): void {
    if (this.controlContainer) {
      this.controlContainer.remove();
    }
  }
}
