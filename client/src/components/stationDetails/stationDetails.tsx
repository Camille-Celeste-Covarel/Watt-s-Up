import { useEffect, useState } from "react";
import type {
  StationAttributes,
  TerminalAttributes,
} from "../../../../server/src/types/models/models";
import "./stationDetails.css";
import type { StationDetailsProps } from "../../types/types_maplibre.ts";

export function StationDetails({ id: stationId }: StationDetailsProps) {
  const [station, setStation] = useState<StationAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      setError("Station ID is missing.");
      setLoading(false);
      return;
    }

    const fetchStationDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/stations/${stationId}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StationAttributes = await response.json();
        setStation(data);
      } catch (err) {
        console.error("Error fetching station details:", err);
        setError("Impossible de charger les détails de la station.");
      } finally {
        setLoading(false);
      }
    };

    void fetchStationDetails();
  }, [stationId]);

  if (loading) {
    return (
      <div className="station-details-content">
        Chargement des détails de la station...
      </div>
    );
  }

  if (error) {
    return <div className="station-details-content error">Erreur: {error}</div>;
  }

  if (!station) {
    return (
      <div className="station-details-content">
        Aucun détail de station trouvé.
      </div>
    );
  }

  return (
    <div className="station-details-content">
      <h2>{station.nom_station}</h2>
      {station.adresse_station && (
        <p>
          <strong>Adresse:</strong> {station.adresse_station}
        </p>
      )}
      {station.implantation_station && (
        <p>
          <strong>Implantation:</strong> {station.implantation_station}
        </p>
      )}
      {station.paiement_cb !== null && (
        <p>
          <strong>Paiement par CB:</strong>{" "}
          {station.paiement_cb ? "Oui" : "Non"}
        </p>
      )}
      {station.paiement_autre && (
        <p>
          <strong>Autre paiement:</strong> {station.paiement_autre}
        </p>
      )}
      {station.tarification && (
        <p>
          <strong>Tarification:</strong> {station.tarification}
        </p>
      )}
      {station.horaires && (
        <p>
          <strong>Horaires:</strong> {station.horaires}
        </p>
      )}
      {station.accessibilite_pmr !== null && (
        <p>
          <strong>Accès PMR:</strong>{" "}
          {station.accessibilite_pmr ? "Oui" : "Non"}
        </p>
      )}
      {station.nbre_pdc !== null && (
        <p>
          <strong>Nombre de points de charge:</strong> {station.nbre_pdc}
        </p>
      )}
      {station.puissance_max !== null && (
        <p>
          <strong>Puissance maximale:</strong> {station.puissance_max} kW
        </p>
      )}
      {station.observations && (
        <p>
          <strong>Observations:</strong> {station.observations}
        </p>
      )}

      {station.terminals && station.terminals.length > 0 && (
        <>
          <h3>Bornes de recharge:</h3>
          <ul className="terminal-list">
            {station.terminals.map((terminal: TerminalAttributes) => (
              <li key={terminal.id} className="terminal-item">
                <p>
                  <strong>Type de prise:</strong> {terminal.type_de_prise}
                </p>
                <p>
                  <strong>Puissance:</strong> {terminal.puissance_nominale} kW
                </p>
                <p>
                  <strong>Statut:</strong>{" "}
                  {terminal.is_booked ? "Occupée" : "Disponible"}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
