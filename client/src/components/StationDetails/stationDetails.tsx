import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type {
  EnrichedStationAttributes,
  Plug,
  TerminalGroup,
} from "../../types/stationDetailsTypes.ts";
import { fetchStationDetails } from "../../utils/stationApi.ts"; // Assurez-vous que cette fonction existe et accepte un ID
import { PlugIcon } from "../DisplaySVGPlug/DisplaySVGPlug";
import "./stationDetails.css";

export function StationDetails() {
  // 1. On récupère l'ID directement depuis l'URL grâce à React Router
  const { id: stationId } = useParams<{ id: string }>();

  // Hooks pour l'état de l'interface utilisateur (inchangés)
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // 2. On utilise useQuery pour récupérer les données de manière moderne et robuste
  const {
    data: station,
    isLoading,
    error,
  } = useQuery<EnrichedStationAttributes, Error>({
    // La clé de la requête inclut l'ID pour être unique et se mettre à jour correctement
    queryKey: ["stationDetails", stationId],
    // La fonction de requête est appelée par useQuery
    queryFn: () => {
      if (!stationId) {
        // Ce garde-fou est essentiel
        throw new Error("Station ID is missing in URL.");
      }
      // On assume que vous avez une fonction qui fetch par ID
      return fetchStationDetails(stationId);
    },
    // La requête ne s'exécute que si l'ID est bien présent dans l'URL
    enabled: !!stationId,
  });

  // 3. Votre logique de groupement des terminaux reste INCHANGÉE
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

  const handleReserve = async () => {
    if (!isAuthenticated || !selectedGroupKey || !stationId) {
      setReservationError("Veuillez sélectionner un groupe et être connecté.");
      return;
    }

    const selectedGroup = terminalGroups.find(
      (g) => g.key === selectedGroupKey,
    );
    if (!selectedGroup) {
      setReservationError("Une erreur est survenue, groupe non trouvé.");
      return;
    }

    setIsReserving(true);
    setReservationError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reservations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            stationId: stationId,
            power: selectedGroup.power,
            plugIds: selectedGroup.plugs.map((p) => p.id),
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "La réservation a échoué.");
      }

      alert(
        "Réservation confirmée ! Vous avez 30 minutes pour démarrer la charge.",
      );
      // On invalide la requête pour forcer le rafraîchissement des données
      await queryClient.invalidateQueries({
        queryKey: ["stationDetails", stationId],
      });
      setSelectedGroupKey(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur inconnue est survenue.";
      setReservationError(errorMessage);
    } finally {
      setIsReserving(false);
    }
  };

  const handleCancel = () => {
    setSelectedGroupKey(null);
  };

  // --- 4. Vos blocs de rendu conditionnel et votre JSX restent INCHANGÉS ---
  if (isLoading) {
    return (
      <div className="station-details-content">
        <p>Chargement des détails de la station...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="station-details-content error">
        <p>Erreur: {error.message}</p>
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
              disabled={!selectedGroupKey || !isAuthenticated || isReserving}
            >
              {isReserving ? "Réservation..." : "Réserver"}
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
          {reservationError && (
            <p className="reservation-error-message">{reservationError}</p>
          )}
        </>
      )}
    </div>
  );
}
