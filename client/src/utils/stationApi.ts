import type { StationMapAttributes } from "../types/types_maplibre.ts";

export const fetchVisibleStations = async (
  bbox: string,
  filters: { vehicles: string[]; powers: string[]; plugs: string[] },
): Promise<StationMapAttributes[]> => {
  let url = `${import.meta.env.VITE_API_URL}/api/stations/visible?bbox=${bbox}`;

  if (filters.vehicles.length > 0)
    url += `&vehicles=${filters.vehicles.join(",")}`;
  if (filters.powers.length > 0) url += `&powers=${filters.powers.join(",")}`;
  if (filters.plugs.length > 0) url += `&plugs=${filters.plugs.join(",")}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
