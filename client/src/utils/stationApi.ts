import type { EnrichedStationAttributes, CreateReservationData, ReservationResponse } from "../types/components/componentsTypes.ts";
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

export async function fetchStationDetails(
  stationId: string,
): Promise<EnrichedStationAttributes> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/stations/${stationId}`,
  );

  if (!response.ok) {
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
  reservationData: CreateReservationData,
): Promise<ReservationResponse> {
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
