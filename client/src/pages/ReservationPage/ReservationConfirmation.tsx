import { Link, useLocation, useNavigate } from "react-router-dom";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext";
import "./ReservationConfirmation.css";

// On définit un type pour les détails de la réservation attendus
// Adaptez-le si la structure de votre API est différente
interface ReservationDetails {
  station: {
    nom_station: string;
    adresse_station: string;
  };
  terminal: {
    puissance_nominale: number;
    plugs: Array<{ name: string }>;
  };
  reservation: {
    id: string;
    expires_at: string; // ex: "2023-10-27T10:30:00Z"
  };
}

export function ReservationConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { closeOverlay } = useOverlay();

  // On récupère les détails passés depuis StationDetails.tsx
  const details: ReservationDetails | undefined =
    location.state?.reservationDetails;

  // Cas de sécurité : si l'utilisateur arrive sur cette page sans passer par la réservation
  if (!details) {
    return (
      <div className="reservation-confirmation-container error-page">
        <h2>Oups !</h2>
        <p>
          Les détails de la réservation sont introuvables. Il semble que vous
          soyez arrivé ici par erreur.
        </p>
        <button
          type="button"
          className="button-primary"
          onClick={() => navigate("/")}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const { station, terminal, reservation } = details;
  const expirationDate = new Date(reservation.expires_at);
  const expirationTime = expirationDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="reservation-confirmation-container">
      <div className="success-header">
        <svg
          className="success-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          // Bonne pratique : on cache l'icône aux lecteurs d'écran car le titre h2 est suffisant
          aria-hidden="true"
        >
          {/* CORRECTION : On ajoute un titre pour l'accessibilité */}
          <title>Icône de succès</title>
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
        <h2>Réservation Confirmée !</h2>
      </div>

      <p className="confirmation-subtitle">
        Votre borne est réservée jusqu'à <strong>{expirationTime}</strong>.
        Voici un résumé de votre réservation :
      </p>

      <div className="details-card">
        <h3>{station.nom_station}</h3>
        <p>{station.adresse_station}</p>
        <div className="details-line-item">
          <span>Puissance</span>
          <strong>{terminal.puissance_nominale} kW</strong>
        </div>
        <div className="details-line-item">
          <span>Prises compatibles</span>
          <strong>{terminal.plugs.map((p) => p.name).join(", ")}</strong>
        </div>
      </div>

      <div className="confirmation-actions">
        <Link to="/reservations" className="button-primary">
          Voir mes réservations
        </Link>
        <button
          type="button"
          className="button-secondary"
          onClick={closeOverlay}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
