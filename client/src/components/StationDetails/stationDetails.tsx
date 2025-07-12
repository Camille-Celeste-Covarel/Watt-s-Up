import { useEffect, useMemo, useState } from "react";
import type {
  EnrichedStationAttributes,
  Plug,
  TerminalGroup,
} from "../../types/stationDetailsTypes.ts";
import "./stationDetails.css";
import type { StationDetailsProps } from "../../types/types_maplibre.ts";
import { PlugIcon } from "../DisplaySVGPlug/DisplaySVGPlug";

export function StationDetails({ id: stationId }: StationDetailsProps) {
  const [station, setStation] = useState<EnrichedStationAttributes | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

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
        const data: EnrichedStationAttributes = await response.json();
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

  // Le hook useMemo pour la grille des bornes est correct.
  const terminalGroups = useMemo(() => {
    if (!station?.terminals) return [];
    const groups = new Map<string, TerminalGroup>();
    for (const terminal of station.terminals) {
      const plugNames =
        terminal.plugs
          ?.map((p) => p.name)
          .sort()
          .join(",") || "N/A";
      const groupKey = `${terminal.puissance_nominale}-${plugNames}`;
      const existingGroup = groups.get(groupKey);
      if (existingGroup) {
        existingGroup.count++;
        if (!terminal.is_booked) {
          existingGroup.availableCount++;
        }
      } else {
        groups.set(groupKey, {
          key: groupKey,
          power: terminal.puissance_nominale,
          plugs: terminal.plugs || [],
          count: 1,
          availableCount: terminal.is_booked ? 0 : 1,
        });
      }
    }
    return Array.from(groups.values());
  }, [station]);

  const handleCardInteraction = (key: string) => {
    setSelectedGroupKey(key === selectedGroupKey ? null : key);
  };

  // --- Blocs de rendu conditionnel ---
  if (loading) {
    return (
      <div className="station-details-content">
        <p>Chargement des détails de la station...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="station-details-content error">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="station-details-content">
        <p>Aucun détail de station trouvé.</p>
      </div>
    );
  }

  const handleReserve = () => {
    if (!selectedGroupKey) {
      alert("Veuillez d'abord sélectionner un groupe de bornes.");
      return;
    }

    // Logique future :
    // 1. Trouver un terminal DISPONIBLE dans le groupe sélectionné.
    // 2. Envoyer une requête POST à votre API (ex: /api/terminals/:id/book)
    // 3. Mettre à jour l'interface si la réservation réussit.
    alert(`Demande de réservation pour le groupe : ${selectedGroupKey}`);
  };

  const handleCancel = () => {
    setSelectedGroupKey(null);
  };

  // --- Rendu final combinant les deux mises en page ---
  return (
    <div className="station-details-content">
      <h2>La station</h2>
      <p className="station-info__text">{station.nom_station}</p>
      {station.adresse_station && (
        <p className="station-info__text">{station.adresse_station}</p>
      )}
      <div className="station-info-details">
        {station.implantation_station && (
          <p className="station-info__text">
            <strong className="station-info__label">Implantation:</strong>{" "}
            {station.implantation_station}
          </p>
        )}
        {station.paiement_cb !== null && (
          <p className="station-info__text">
            <strong className="station-info__label">Paiement par CB:</strong>{" "}
            {station.paiement_cb ? "Oui" : "Non"}
          </p>
        )}
        {station.paiement_autre && (
          <p className="station-info__text">
            <strong className="station-info__label">Autre paiement:</strong>{" "}
            {station.paiement_autre ? "Oui" : "Non"}
          </p>
        )}
        {station.tarification && (
          <p className="station-info__text">
            <strong className="station-info__label">Tarification:</strong>{" "}
            {station.tarification}
          </p>
        )}
        {station.horaires && (
          <p className="station-info__text">
            <strong className="station-info__label">Horaires:</strong>{" "}
            {station.horaires}
          </p>
        )}
        {station.accessibilite_pmr !== null && (
          <p className="station-info__text">
            <strong className="station-info__label">Accès PMR:</strong>{" "}
            {station.accessibilite_pmr ? "Oui" : "Non"}
          </p>
        )}
        {station.nbre_pdc !== null && (
          <p className="station-info__text">
            <strong className="station-info__label">
              Nombre de points de charge:
            </strong>{" "}
            {station.nbre_pdc}
          </p>
        )}
        {station.puissance_max !== null && (
          <p className="station-info__text">
            <strong className="station-info__label">Puissance maximale:</strong>{" "}
            {station.puissance_max} kW
          </p>
        )}
        {station.observations && (
          <p className="station-info__text">
            <strong className="station-info__label">Observations:</strong>{" "}
            {station.observations}
          </p>
        )}
      </div>

      {terminalGroups.length > 0 && (
        <>
          <h3 className="station-list-title terminal-groups-grid__title">
            Choisir ma borne
          </h3>
          <div className="terminal-groups-grid">
            {terminalGroups.map((group) => {
              const cardClasses = [
                "terminal-group-card",
                group.availableCount > 0 ? "available" : "unavailable",
                group.key === selectedGroupKey ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={group.key}
                  type="button"
                  className={cardClasses}
                  onClick={() => handleCardInteraction(group.key)}
                  disabled={group.availableCount === 0}
                >
                  <div className="group-plugs">
                    {group.plugs.map((plug: Plug) => (
                      <PlugIcon
                        key={plug.id}
                        plugName={plug.name}
                        className="plug-icon"
                      />
                    ))}
                  </div>
                  <div className="group-power">{group.power} kW</div>
                  <div className="group-availability">
                    {group.availableCount}/{group.count}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="action-buttons-container">
            <button
              type="button"
              className="action-button reserve-button"
              onClick={handleReserve}
              disabled={!selectedGroupKey}
            >
              Réserver
            </button>
            <button
              type="button"
              className="action-button cancel-button"
              onClick={handleCancel}
              disabled={!selectedGroupKey}
            >
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}
