import type { EnrichedStationAttributes } from "../types/stationDetailsTypes";
import type { StationMapAttributes } from "../types/types_maplibre";

export async function fetchVisibleStations(
  bbox: string,
  filters: {
    vehicles: string[];
    powers: string[];
    plugs: string[];
  },
  zoom: number,
): Promise<StationMapAttributes[]> {
  const params = new URLSearchParams({ bbox });

  if (filters.vehicles.length > 0) {
    params.append("vehicles", filters.vehicles.join(","));
  }
  if (filters.powers.length > 0) {
    params.append("powers", filters.powers.join(","));
  }
  if (filters.plugs.length > 0) {
    params.append("plugs", filters.plugs.join(","));
  }
  params.append("zoom", zoom.toString());

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/stations/visible?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

/**
 * Récupère les détails complets d'une seule station par son ID.
 * @param stationId - L'identifiant de la station à récupérer.
 * @returns Une promesse qui se résout avec les données de la station.
 */
export async function fetchStationDetails(
  stationId: string,
): Promise<EnrichedStationAttributes> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/stations/${stationId}`,
  );

  if (!response.ok) {
    // Essaye de récupérer un message d'erreur plus précis depuis l'API
    const errorData = await response.json().catch(() => ({
      message: "Une erreur de communication avec le serveur est survenue.",
    }));
    throw new Error(
      errorData.message ||
        `Failed to fetch station details for ID ${stationId}`,
    );
  }

  return response.json();
}
