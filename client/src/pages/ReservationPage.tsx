import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
interface Plug {
  id: string;
  name: string;
}

interface Station {
  id: string;
  nom_station: string;
  adresse_station: string;
}

interface Terminal {
  id: string;
  puissance_nominale: number;
  num_pdc: string | null;
  station: Station;
  plugs: Plug[];
}

interface Reservation {
  id: string;
  status: "ACTIVE" | "IN_USE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  expires_at: string;
  createdAt: string;
  terminal: Terminal;
}

export function ReservationPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        setError("Vous devez être connecté pour voir vos réservations.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reservations/me`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            data.message || "Erreur lors du chargement des réservations.",
          );
        }

        const data: Reservation[] = await response.json();
        setReservations(data);
      } catch (err) {
        console.error("Échec du chargement des réservations:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur inconnue est survenue.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      void fetchReservations();
    }
  }, [isAuthenticated, isLoading]);

  // Affichage conditionnel selon l'état de chargement ou d'erreur
  if (loading || isLoading) {
    return (
      <div className="page-content">Chargement de vos réservations...</div>
    );
  }

  if (error) {
    return <div className="page-content error">Erreur: {error}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="page-content">
        Veuillez vous connecter pour voir vos réservations.
      </div>
    );
  }

  // Pour l'instant, on affiche juste les données brutes pour vérifier la structure
  return (
    <div className="page-content">
      <h1>Mes Réservations</h1>
      {reservations.length === 0 ? (
        <p>Vous n'avez aucune réservation pour le moment.</p>
      ) : (
        <pre>{JSON.stringify(reservations, null, 2)}</pre>
      )}
    </div>
  );
}
