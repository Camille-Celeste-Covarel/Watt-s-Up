import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./ReservationPage.css";

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
  charge_started_at: string | null;
  session_ends_at: string | null;
  createdAt: string;
  terminal: Terminal;
}

// --- Fonctions utilitaires

const statusLabels: { [key in Reservation["status"]]: string } = {
  ACTIVE: "Réservée",
  IN_USE: "En charge",
  COMPLETED: "Terminée",
  EXPIRED: "Expirée",
  CANCELLED: "Annulée",
};

const getRemainingTime = (expiresAt: string) => {
  const diff = new Date(expiresAt).getTime() - new Date().getTime();
  if (diff <= 0) return "Expirée";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

const getElapsedTime = (startTime: string) => {
  const diff = new Date().getTime() - new Date(startTime).getTime();
  if (diff < 0) return "00:00:00";

  const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// --- Sous-composant pour l'affichage ---
const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
  const { terminal } = reservation;
  const { station, plugs } = terminal;

  const formattedDate = new Date(reservation.createdAt).toLocaleDateString(
    "fr-FR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="reservation-card">
      <div className="reservation-card-header">
        <h3>{station.nom_station}</h3>
        <p>{station.adresse_station}</p>
      </div>

      <div className="reservation-details">
        <div className="detail-block">
          <h4>Borne</h4>
          <ul>
            <li>Puissance: {terminal.puissance_nominale} kW</li>
            <li>Prises: {plugs.map((p) => p.name).join(", ")}</li>
          </ul>
        </div>
        <div className="detail-block">
          <h4>Réservation</h4>
          <ul>
            <li>Date: {formattedDate}</li>
            <li>
              Statut:{" "}
              <span className={`status status-${reservation.status}`}>
                {statusLabels[reservation.status]}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Composant principal ---
export function ReservationPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // --- Filtrage des réservations ---
  const { activeReservation, pastReservations } = useMemo(() => {
    const active = reservations.find(
      (r) => r.status === "ACTIVE" || r.status === "IN_USE",
    );
    const past = reservations.filter(
      (r) => r.status !== "ACTIVE" && r.status !== "IN_USE",
    );
    return { activeReservation: active, pastReservations: past };
  }, [reservations]);

  const [remainingTime, setRemainingTime] = useState("");

  // On enveloppe la fonction dans useCallback pour la stabiliser
  const fetchReservations = useCallback(async () => {
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeReservation) return;

    const interval = setInterval(() => {
      if (activeReservation.status === "ACTIVE") {
        setRemainingTime(getRemainingTime(activeReservation.expires_at));
      } else if (
        activeReservation.status === "IN_USE" &&
        activeReservation.charge_started_at
      ) {
        setRemainingTime(getElapsedTime(activeReservation.charge_started_at));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReservation]);

  useEffect(() => {
    if (!isLoading) {
      void fetchReservations();
    }
  }, [isLoading, fetchReservations]);

  const handleCancelReservation = async (reservationId: string) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
    ) {
      return;
    }

    setIsActionLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reservations/me/${reservationId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "L'annulation a échoué.");
      }

      await fetchReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStartCharge = async (reservationId: string) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reservations/me/${reservationId}/start`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Le démarrage de la charge a échoué.");
      }

      await fetchReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsActionLoading(false);
    }
  };

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

  return (
    <div className="page-content reservations-page">
      <h1>Mes Réservations</h1>

      {/* --- Section Réservation en cours --- */}
      {activeReservation && (
        <section className="reservation-section">
          <h2>
            {activeReservation.status === "IN_USE"
              ? "Charge en cours"
              : "Borne réservée"}
          </h2>
          <ReservationCard reservation={activeReservation} />

          {/* Affiche les infos et actions pour une réservation ACTIVE */}
          {activeReservation.status === "ACTIVE" && (
            <>
              <p>
                La réservation expire dans : <strong>{remainingTime}</strong>
              </p>
              <div className="reservation-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStartCharge(activeReservation.id)}
                  disabled={isActionLoading}
                >
                  Commencer la charge
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleCancelReservation(activeReservation.id)}
                  disabled={isActionLoading}
                >
                  Annuler
                </button>
              </div>
            </>
          )}

          {/* Affiche les infos et actions pour une charge IN_USE */}
          {activeReservation.status === "IN_USE" && (
            <>
              <p style={{ marginTop: "1rem" }}>
                Temps de charge : <strong>{remainingTime}</strong>
              </p>
              {/* --- Ligne de debug pour le dev --- */}
              {activeReservation.session_ends_at && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "grey",
                    fontStyle: "italic",
                  }}
                >
                  [DEV] Fin de session prévue à :{" "}
                  {new Date(
                    activeReservation.session_ends_at,
                  ).toLocaleTimeString("fr-FR")}
                </p>
              )}
              <div className="reservation-actions">
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled
                  title="Fonctionnalité à venir"
                >
                  Arrêter la charge
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/*Section Historique*/}
      {pastReservations.length > 0 && (
        <section className="reservation-section">
          <h2>Historique</h2>
          {pastReservations.slice(0, 5).map((reservation) => (
            <details key={reservation.id} className="history-item">
              <summary className="history-summary">
                <span>
                  {reservation.terminal.station.nom_station} -{" "}
                  {new Date(reservation.createdAt).toLocaleDateString("fr-FR")}
                </span>
                <span className={`status status-${reservation.status}`}>
                  {statusLabels[reservation.status]}
                </span>
              </summary>
              <ReservationCard reservation={reservation} />
            </details>
          ))}
        </section>
      )}

      {/* --- Section d'aide --- */}
      <section className="reservation-section">
        <h2>Un problème ?</h2>
        <p>
          Si vous rencontrez un souci avec une réservation, n'hésitez pas à nous
          le signaler.
        </p>
        <Link to="/contact" className="btn">
          Contactez-nous
        </Link>
      </section>
    </div>
  );
}
