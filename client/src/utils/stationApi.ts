export async function fetchVisibleStations(
  bbox: string,
  filters: {
    vehicles: string[];
    powers: string[];
    plugs: string[];
  },
  zoom: number,
) {
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
