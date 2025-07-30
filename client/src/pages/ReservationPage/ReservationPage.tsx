import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import { useAuth } from "../../contexts/AuthContext";
import { useToastStore } from "../../utils/useToast";
import "./ReservationPage.css";
import type { Reservation } from "../../types/pages/pagesTypes.ts";

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
const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
  const { terminal } = reservation;
  const { station, plugs } = terminal;
  const formattedDate = new Date(reservation.createdAt).toLocaleDateString(
    "fr-FR",
    { year: "numeric", month: "long", day: "numeric" },
  );
  return (
    <div className="reservation-card">
      {" "}
      <div className="reservation-card-header">
        <h4>Station</h4>
        <p>{station.adresse_station}</p>{" "}
      </div>{" "}
      <div className="reservation-details">
        {" "}
        <div className="detail-block">
          {" "}
          <h4>Borne</h4>{" "}
          <ul>
            {" "}
            <li>Puissance: {terminal.puissance_nominale} kW</li>{" "}
            <li>Prises: {plugs.map((p) => p.name).join(", ")}</li>{" "}
          </ul>{" "}
        </div>{" "}
        <div className="detail-block">
          {" "}
          <h4>Réservation</h4>{" "}
          <ul>
            {" "}
            <li>Date: {formattedDate}</li>{" "}
            <li>
              {" "}
              Statut:{" "}
              <span className={`status status-${reservation.status}`}>
                {" "}
                {statusLabels[reservation.status]}{" "}
              </span>{" "}
            </li>{" "}
          </ul>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

const apiAction = async (url: string, method: "POST" | "DELETE") => {
  const response = await fetch(url, { method, credentials: "include" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "L'opération a échoué.");
  }
  return data;
};

export function ReservationPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToastStore();
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null as "cancel" | "stop" | null,
    reservationId: null as string | null,
    title: "",
    message: "",
  });
  const [remainingTime, setRemainingTime] = useState("");

  const {
    data: reservations = [],
    isLoading: isReservationsLoading,
    error,
  } = useQuery<Reservation[], Error>({
    queryKey: ["reservations", "me"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reservations/me`,
        { credentials: "include" },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || "Erreur lors du chargement des réservations.",
        );
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const { activeReservation, pastReservations } = useMemo((): {
    activeReservation: Reservation | undefined;
    pastReservations: Reservation[];
  } => {
    const active = reservations.find(
      (r) => r.status === "ACTIVE" || r.status === "IN_USE",
    );
    const past = reservations.filter(
      (r) => r.status !== "ACTIVE" && r.status !== "IN_USE",
    );
    return { activeReservation: active, pastReservations: past };
  }, [reservations]);

  const handleMutationError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : "Une erreur inconnue est survenue.";
    showToast({ type: "error", message });
  };

  // --- Mutations distinctes pour chaque action (plus clair) ---
  const startChargeMutation = useMutation({
    mutationFn: (reservationId: string) =>
      apiAction(
        `${import.meta.env.VITE_API_URL}/api/reservations/me/${reservationId}/start`,
        "POST",
      ),
    onSuccess: () => {
      showToast({ type: "success", message: "La charge a bien démarré !" });
      void queryClient.invalidateQueries({ queryKey: ["reservations", "me"] });
    },
    onError: handleMutationError,
  });

  const cancelReservationMutation = useMutation({
    mutationFn: (reservationId: string) =>
      apiAction(
        `${import.meta.env.VITE_API_URL}/api/reservations/me/${reservationId}`,
        "DELETE",
      ),
    onSuccess: () => {
      showToast({
        type: "success",
        message: "Réservation annulée avec succès.",
      });
      void queryClient.invalidateQueries({ queryKey: ["reservations", "me"] });
    },
    onError: handleMutationError,
    onSettled: () =>
      setModalState({
        isOpen: false,
        action: null,
        reservationId: null,
        title: "",
        message: "",
      }),
  });

  const stopChargeMutation = useMutation({
    mutationFn: (reservationId: string) =>
      apiAction(
        `${import.meta.env.VITE_API_URL}/api/reservations/me/${reservationId}/stop`,
        "POST",
      ),
    onSuccess: () => {
      showToast({ type: "success", message: "Charge arrêtée avec succès." });
      void queryClient.invalidateQueries({ queryKey: ["reservations", "me"] });
    },
    onError: handleMutationError,
    onSettled: () =>
      setModalState({
        isOpen: false,
        action: null,
        reservationId: null,
        title: "",
        message: "",
      }),
  });

  const isActionPending =
    startChargeMutation.isPending ||
    cancelReservationMutation.isPending ||
    stopChargeMutation.isPending;

  // --- Fonctions de gestion des événements ---
  useEffect(() => {
    if (!activeReservation) return;
    const interval = setInterval(() => {
      if (activeReservation.status === "ACTIVE")
        setRemainingTime(getRemainingTime(activeReservation.expires_at));
      else if (
        activeReservation.status === "IN_USE" &&
        activeReservation.charge_started_at
      )
        setRemainingTime(getElapsedTime(activeReservation.charge_started_at));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeReservation]);

  const openCancelModal = (reservationId: string) => {
    setModalState({
      isOpen: true,
      action: "cancel",
      reservationId,
      title: "Annuler la réservation",
      message: "Êtes-vous sûr de vouloir annuler cette réservation ?",
    });
  };

  const openStopModal = (reservationId: string) => {
    setModalState({
      isOpen: true,
      action: "stop",
      reservationId,
      title: "Arrêter la charge",
      message: "Êtes-vous sûr de vouloir arrêter la charge en cours ?",
    });
  };

  const handleConfirmAction = () => {
    if (!modalState.action || !modalState.reservationId) return;

    if (modalState.action === "cancel") {
      cancelReservationMutation.mutate(modalState.reservationId);
    } else if (modalState.action === "stop") {
      stopChargeMutation.mutate(modalState.reservationId);
    }
  };

  if (isReservationsLoading || isAuthLoading)
    return (
      <div className="page-content">Chargement de vos réservations...</div>
    );
  if (error)
    return <div className="page-content error">Erreur: {error.message}</div>;
  if (!isAuthenticated)
    return (
      <div className="page-content">
        Veuillez vous connecter pour voir vos réservations.
      </div>
    );

  return (
    <div className="page-content reservations-page">
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
      >
        <p>{modalState.message}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setModalState({ ...modalState, isOpen: false })}
          >
            Non, annuler
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmAction}
            disabled={isActionPending}
          >
            {isActionPending ? "Confirmation..." : "Oui, confirmer"}
          </button>
        </div>
      </Modal>
      <div className="active-reservation">
        <h1>En cours</h1>

        {activeReservation ? (
          <section className="reservation">
            <h2>
              {activeReservation.status === "IN_USE"
                ? "Charge en cours"
                : "Borne réservée"}
            </h2>
            <ReservationCard reservation={activeReservation} />
            {activeReservation.status === "ACTIVE" && (
              <>
                <p>
                  La réservation expire dans <strong>{remainingTime}</strong>
                </p>
                <div className="reservation-actions">
                  <button
                    type="button"
                    className="start-charge-button"
                    onClick={() =>
                      startChargeMutation.mutate(activeReservation.id)
                    }
                    disabled={isActionPending}
                  >
                    Commencer la charge
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openCancelModal(activeReservation.id)}
                    disabled={isActionPending}
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
            {activeReservation.status === "IN_USE" && (
              <>
                <p style={{ marginTop: "1rem" }}>
                  Temps de charge : <strong>{remainingTime}</strong>
                </p>
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
                    onClick={() => openStopModal(activeReservation.id)}
                    disabled={isActionPending}
                  >
                    Arrêter la charge
                  </button>
                </div>
              </>
            )}
          </section>
        ) : (
          <section className="reservation">
            <h2>Aucune réservation active</h2>
            <p>
              Vous n'avez pas de réservation en cours. Trouvez une borne et
              réservez-la dès maintenant !
            </p>
            <Link to="/" className="btn">
              Trouver une borne
            </Link>
          </section>
        )}
      </div>

      <div className="history">
        {pastReservations.length > 0 && (
          <section className="reservation">
            <h2>Historique</h2>
            {pastReservations.slice(0, 5).map((reservation) => (
              <details key={reservation.id} className="history-item">
                <summary className="history-summary">
                  <span>
                    {new Date(reservation.createdAt).toLocaleDateString(
                      "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
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

        <section className="reservation">
          <h2>Un problème ?</h2>
          <p>
            Si vous rencontrez un souci avec une réservation, n'hésitez pas à
            nous le signaler.
          </p>
          <Link to="/contact" className="btn">
            Contactez-nous
          </Link>
        </section>
      </div>
    </div>
  );
}
