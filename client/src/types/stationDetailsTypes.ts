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

export interface EnrichedStationAttributes extends StationAttributes {
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
