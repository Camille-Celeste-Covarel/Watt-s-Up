import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type {
  Reservation,
  ReservationSuccessPageLocationState,
} from "../../types/pages/pagesTypes";
import "./ReservationSuccessPage.css";

const statusLabels: { [key in Reservation["status"]]: string } = {
  ACTIVE: "Réservée",
  IN_USE: "En charge",
  COMPLETED: "Terminée",
  EXPIRED: "Expirée",
  CANCELLED: "Annulée",
};

function ReservationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    reservation: apiResponse,
    station,
    selectedGroup,
  } = (location.state as ReservationSuccessPageLocationState) || {};

  useEffect(() => {
    if (!apiResponse || !station || !selectedGroup) {
      navigate("/reservations");
    }
  }, [apiResponse, station, selectedGroup, navigate]);

  if (!apiResponse || !station || !selectedGroup) {
    return (
      <div className="reservation-success-page">
        <p>Chargement de la confirmation...</p>
      </div>
    );
  }

  const formattedReservationDate = new Date(
    apiResponse.createdAt,
  ).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const expiresAt = new Date(apiResponse.expires_at);
  const formattedExpiryDate = expiresAt.toLocaleDateString("fr-FR");
  const formattedExpiryTime = expiresAt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="reservation-success-page">
      <div className="reservation-success-content">
        <h2>Réservation confirmée !</h2>
        <p className="intro-text">
          Votre borne est prête et vous attend. Voici un résumé de votre
          réservation.
        </p>

        <div className="reservation-summary">
          <div className="summary-header">
            <h3>{station.nom_station}</h3>
            <p>{station.adresse_station}</p>
          </div>
          <div className="summary-details">
            <div className="detail-block">
              <h4>Borne</h4>
              <ul>
                <li>Puissance: {selectedGroup.power} kW</li>
                <li>
                  Prises: {selectedGroup.plugs.map((p) => p.name).join(", ")}
                </li>
              </ul>
            </div>
            <div className="detail-block">
              <h4>Réservation</h4>
              <ul>
                <li>Date: {formattedReservationDate}</li>
                <li>
                  Statut:
                  {/* MODIFIÉ : status en minuscule pour correspondre au CSS */}
                  <span
                    className={`status status-${apiResponse.status.toLowerCase()}`}
                  >
                    {statusLabels[apiResponse.status]}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="expires-info">
          Votre borne est réservée jusqu'au{" "}
          <strong>
            {formattedExpiryDate} à {formattedExpiryTime}
          </strong>
          .
        </p>
        <div className="success-actions">
          {/* MODIFIÉ : Utilisation des classes de boutons de votre DA */}
          <Link to="/reservations" className="action-button primary-action">
            Voir toutes mes réservations
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ReservationSuccessPage;
