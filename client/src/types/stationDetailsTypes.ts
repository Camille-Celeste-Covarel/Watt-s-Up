import type {
  StationAttributes,
  TerminalAttributes,
} from "../../../server/src/types/models/models.ts";

export interface Plug {
  id: string;
  name: string;
}

export interface EnrichedTerminalAttributes extends TerminalAttributes {
  plugs?: Plug[];
}

// On met à jour cette interface pour inclure les champs manquants
export interface EnrichedStationAttributes extends StationAttributes {
  // Ajout des propriétés utilisées dans le composant StationDetails
  code_postal: string;
  ville: string;
  statut_public: string;

  // Cette propriété était déjà là et est correcte
  terminals?: EnrichedTerminalAttributes[];
}

export interface PlugIconProps {
  plugName: string;
  className?: string;
}

export interface TerminalGroup {
  key: string;
  power: number;
  plugs: Plug[];
  count: number;
  availableCount: number;
}
