import type { EnrichedStationAttributes } from "../types/components/componentsTypes.ts";
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

/**
 * Supprime une station par son ID.
 * @param stationId - L'identifiant de la station à supprimer.
 * @returns Une promesse qui se résout si la suppression est réussie.
 */
export async function deleteStation(stationId: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/stations/${stationId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Une erreur de communication avec le serveur est survenue.",
    }));
    throw new Error(
      errorData.message || `Failed to delete station with ID ${stationId}`,
    );
  }
}

export async function createReservation(
  reservationData: any,
): Promise<any> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/reservations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(reservationData),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Une erreur de communication avec le serveur est survenue.",
    }));
    throw new Error(
      errorData.message || "Failed to create reservation.",
    );
  }

  return response.json();
}
