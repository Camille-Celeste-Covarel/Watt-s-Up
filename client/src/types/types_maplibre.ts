import type { StationAttributes } from "./models/models.ts";

export interface StationMapAttributes extends StationAttributes {
  availableTerminalsCount?: number;
  totalTerminalsCount?: number;
}

export interface StationDetailsPanelProps {
  stationId: string | null;
  onClose: () => void;
}

export interface StationDetailsProps {
  id?: string;
}
