export const createReservation = async (payload: {
  stationId: string;
  power: number;
  plugIds: string[];
}) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/reservations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "La réservation a échoué.");
  }
  return data;
};

export const fetchReservationById = async (reservationId: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/reservations/${reservationId}`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Impossible de récupérer les détails de la réservation.");
  }
  return response.json();
};
