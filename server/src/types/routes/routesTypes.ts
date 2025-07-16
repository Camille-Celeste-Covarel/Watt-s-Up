export interface TerminalCount {
  id_station: string;
  totalTerminalsCount: string;
  availableTerminalsCount: string;
}

export interface RawStationData {
  id: string;
  geojson_geom: string;
}
