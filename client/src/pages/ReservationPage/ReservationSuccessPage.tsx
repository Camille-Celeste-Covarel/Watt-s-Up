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
      <div className="success-page-container">
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
    <div className="success-page-container">
      <h2>Réservation confirmée !</h2>

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
                <span className={`status status-${apiResponse.status}`}>
                  {statusLabels[apiResponse.status]}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="expires-info">
        Votre borne de recharge est réservée jusqu'au{" "}
        <strong>
          {formattedExpiryDate} à {formattedExpiryTime}
        </strong>
        . Pensez à valider votre réservation dans votre page{" "}
        <strong>mes réservations.</strong>
      </p>
      <div className="success-actions">
        <Link to="/reservations" className="btn btn-primary">
          Voir toutes mes réservations
        </Link>
      </div>
    </div>
  );
}

export default ReservationSuccessPage;
