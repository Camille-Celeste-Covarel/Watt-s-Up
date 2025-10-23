import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import { useAuth } from "../../contexts/AuthContext";
import type {
  EnrichedStationAttributes,
  Plug,
  TerminalGroup,
} from "../../types/components/componentsTypes.ts";
import { createReservation, deleteStation } from "../../utils/stationApi.ts";
import { fetchStationDetails } from "../../utils/stationApi.ts";
import { useToastStore } from "../../utils/useToast.ts";
import { PlugIcon } from "../DisplaySVGPlug/DisplaySVGPlug";
import "./stationDetails.css";

export function StationDetails() {
  const { id: stationId } = useParams<{ id: string }>();
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const {
    data: station,
    isLoading,
    error,
  } = useQuery<EnrichedStationAttributes, Error>({
    queryKey: ["stationDetails", stationId],
    queryFn: () => {
      if (!stationId) throw new Error("Station ID is missing in URL.");
      return fetchStationDetails(stationId);
    },
    enabled: !!stationId,
  });

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
        if (!terminal.is_booked) existingGroup.availableCount++;
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

  const selectedGroup = useMemo(
    () => terminalGroups.find((g) => g.key === selectedGroupKey),
    [terminalGroups, selectedGroupKey],
  );

  const reservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (data) => {
      navigate(`/reservation/success/${data.id}`, {
        state: { reservation: data, station, selectedGroup },
      });

      void queryClient.invalidateQueries({
        queryKey: ["stationDetails", stationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["reservations", "me"] });
      setSelectedGroupKey(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur inconnue est survenue.";
      showToast({ type: "error", message });
    },
  });

  const deleteStationMutation = useMutation({
    mutationFn: (id: string) => deleteStation(id),
    onSuccess: () => {
      showToast({ type: "success", message: "Station supprimée avec succès." });
      void queryClient.invalidateQueries({ queryKey: ["stations"] });
      navigate("/");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la suppression de la station.";
      showToast({ type: "error", message });
    },
  });

  const handleReserveClick = () => {
    if (!isAuthenticated || !selectedGroupKey) {
      showToast({
        type: "error",
        message: "Veuillez sélectionner une borne et être connecté.",
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmReservation = () => {
    if (!stationId || !selectedGroup) return;
    setIsModalOpen(false);
    reservationMutation.mutate({
      stationId,
      power: selectedGroup.power,
      plugIds: selectedGroup.plugs.map((p) => p.id),
    });
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!stationId) return;
    setIsDeleteModalOpen(false);
    deleteStationMutation.mutate(stationId);
  };

  const handleCancelClick = () => {
    if (selectedGroupKey) {
      setSelectedGroupKey(null);
    } else {
      navigate("/");
    }
  };

  if (isLoading)
    return (
      <div className="station-details-content">
        <p>Chargement...</p>
      </div>
    );
  if (error)
    return (
      <div className="station-details-content error">
        <p>Erreur: {error.message}</p>
      </div>
    );
  if (!station)
    return (
      <div className="station-details-content">
        <p>Station non trouvée.</p>
      </div>
    );

  return (
    <div className="station-details-content">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmer la réservation"
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmReservation}
              disabled={reservationMutation.isPending || !selectedGroup}
            >
              {reservationMutation.isPending ? "Confirmation..." : "Confirmer"}
            </button>
          </>
        }
      >
        {selectedGroup ? (
          <p>
            Vous êtes sur le point de réserver une borne de type{" "}
            <strong>
              {selectedGroup.plugs.map((p) => p.name).join(" / ")}
            </strong>{" "}
            ({selectedGroup.power} kW). Confirmez-vous ?
          </p>
        ) : null}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={deleteStationMutation.isPending}
            >
              {deleteStationMutation.isPending ? "Suppression..." : "Supprimer"}
            </button>
          </>
        }
      >
        <p>
          Êtes-vous sûr de vouloir supprimer la station{" "}
          <strong>{station.nom_station}</strong> ? Cette action est irréversible.
        </p>
      </Modal>

      <h2>{station.nom_station}</h2>
      <p className="station-info__text">{station.adresse_station}</p>

      <div className="station-info-details">
        {station.implantation_station && (
          <div className="info-item">
            <span className="station-info__label">Implantation:</span>
            <span className="station-info__text">
              {station.implantation_station}
            </span>
          </div>
        )}
        {station.horaires && (
          <div className="info-item">
            <span className="station-info__label">Horaires:</span>
            <span className="station-info__text">{station.horaires}</span>
          </div>
        )}
        {station.accessibilite_pmr !== null && (
          <div className="info-item">
            <span className="station-info__label">Accès PMR:</span>
            <span className="station-info__text">
              {station.accessibilite_pmr ? "Oui" : "Non"}
            </span>
          </div>
        )}
        {station.nbre_pdc !== null && (
          <div className="info-item">
            <span className="station-info__label">Points de charge:</span>
            <span className="station-info__text">{station.nbre_pdc}</span>
          </div>
        )}
        {station.puissance_max !== null && (
          <div className="info-item">
            <span className="station-info__label">Puissance max:</span>
            <span className="station-info__text">
              {station.puissance_max} kW
            </span>
          </div>
        )}
        {station.paiement_cb !== null && (
          <div className="info-item">
            <span className="station-info__label">Paiement par CB:</span>
            <span className="station-info__text">
              {station.paiement_cb ? "Oui" : "Non"}
            </span>
          </div>
        )}
        {station.paiement_autre && (
          <div className="info-item">
            <span className="station-info__label">Autre paiement:</span>
            <span className="station-info__text">{station.paiement_autre}</span>
          </div>
        )}
        {station.tarification && (
          <div className="info-item">
            <span className="station-info__label">Tarification:</span>
            <span className="station-info__text">{station.tarification}</span>
          </div>
        )}
        {station.observations && (
          <div className="info-item">
            <span className="station-info__label">Observations:</span>
            <span className="station-info__text">{station.observations}</span>
          </div>
        )}
      </div>

      {terminalGroups.length > 0 && (
        <>
          <h3 className="station-list-title">Choisir ma borne</h3>
          <div className="terminal-groups-grid">
            {terminalGroups.map((group) => (
              <button
                key={group.key}
                type="button"
                className={`terminal-group-card ${
                  group.availableCount > 0 ? "available" : "unavailable"
                } ${group.key === selectedGroupKey ? "selected" : ""}`}
                onClick={() => setSelectedGroupKey(group.key)}
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
            ))}
          </div>
          <div className="action-buttons-container">
            <button
              type="button"
              className="action-button reserve-button"
              onClick={handleReserveClick}
              disabled={
                !selectedGroupKey ||
                !isAuthenticated ||
                reservationMutation.isPending
              }
            >
              {reservationMutation.isPending ? "Réservation..." : "Réserver"}
            </button>
            <button
              type="button"
              className="action-button cancel-button"
              onClick={handleCancelClick}
            >
              {selectedGroupKey ? "Annuler" : "Retour à la carte"}
            </button>
            {user?.isAdmin && (
              <button
                type="button"
                className="action-button delete-button"
                onClick={handleDeleteClick}
                disabled={deleteStationMutation.isPending}
              >
                Supprimer la station
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
