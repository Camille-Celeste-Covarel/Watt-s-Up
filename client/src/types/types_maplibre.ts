import type { StationAttributes } from "../../../server/src/types/models/models.ts";

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
