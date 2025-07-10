import type * as GeoJSON from "geojson";
import sequelize from "sequelize";
import type { CsvRow } from "../types/dataProcessing/dataProcessing";
import type {
  TransformError,
  TransformedData,
} from "../types/dataProcessing/importProcessingTypes";
import type {
  StationAttributes,
  TerminalAttributes,
} from "../types/models/models";

import {
  getNonBooleanString,
  normalizeString,
  parseBoolean,
  parseDate,
  parseGeoJSONPoint,
  parseNumber,
  parseSeparateGeoJSONCoordinates,
} from "./stringNormalizer";

import {
  findOrCreateAccessByName,
  findOrCreateCompagnyByName,
  findOrCreateOperatorByName,
  findOrCreatePlugByName,
  findOrCreatePowerByName,
  findOrCreateProviderByName,
} from "./importCache";

import { LogLevel } from "../tools/logger";

function createTransformError(
  type: string,
  message: string,
  rowNumber: number,
  rowData: CsvRow,
  columnName?: string,
  culpritValue?: string,
  originalError?: unknown,
): { success: false; error: TransformError } {
  console.error(
    `[ERROR - dataTransformer] Erreur de transformation créée: Type=${type}, Ligne=${rowNumber}, Message=${message}, Colonne=${columnName || "N/A"}, Valeur=${culpritValue || "N/A"}`,
    LogLevel.ERROR,
    originalError,
  );
  return {
    success: false,
    error: {
      type,
      message,
      rowNumber,
      rowData,
      columnName,
      culpritValue,
      originalError,
    },
  };
}

export async function transformCsvRowToEntities(
  row: CsvRow,
  rowNumber: number,
): Promise<
  | { success: true; data: TransformedData }
  | { success: false; error: TransformError }
> {
  console.log(
    `[DEBUG - dataTransformer] Début de transformation pour la ligne CSV #${rowNumber}`,
    LogLevel.DEBUG,
  );
  console.log(
    `[DEBUG - dataTransformer] Raw row data: ${JSON.stringify(row).substring(0, 200)}...`,
    LogLevel.DEBUG,
  );

  try {
    const idStationItinerance = normalizeString(
      row.id_station_itinerance || null,
    );
    const nomStation = normalizeString(row.nom_station || null);
    const adresseStation = normalizeString(row.adresse_station || null);
    const codeInsee = normalizeString(row.code_insee_commune || null);

    let consolidatedLatitude: number | null = null;
    let consolidatedLongitude: number | null = null;
    let geom: GeoJSON.Point | null = null;

    // Gestion des coordonnées (priorité à coordonneesXY si présent)
    if (row.coordonneesXY) {
      geom = parseGeoJSONPoint(row.coordonneesXY);
      if (geom) {
        [consolidatedLongitude, consolidatedLatitude] = geom.coordinates;
      } else {
        return createTransformError(
          "INVALID_GEOJSON_FORMAT",
          "Format GeoJSON invalide pour coordonneesXY.",
          rowNumber,
          row,
          "coordonneesXY",
          row.coordonneesXY,
        );
      }
    } else if (row.consolidated_latitude && row.consolidated_longitude) {
      const point = parseSeparateGeoJSONCoordinates(
        row.consolidated_latitude,
        row.consolidated_longitude,
      );

      if (point) {
        [consolidatedLongitude, consolidatedLatitude] = point.coordinates;
        geom = sequelize.literal(
          `ST_SetSRID(ST_MakePoint(${consolidatedLongitude}, ${consolidatedLatitude}), 4326)`,
        ) as unknown as GeoJSON.Point;
      } else {
        return createTransformError(
          "INVALID_COORDINATES",
          "Coordonnées latitude/longitude consolidées invalides.",
          rowNumber,
          row,
          "consolidated_latitude/consolidated_longitude",
          `${row.consolidated_latitude}, ${row.consolidated_longitude}`,
        );
      }
    } else {
      return createTransformError(
        "MISSING_COORDINATES",
        "Coordonnées manquantes (coordonneesXY ou consolidated_latitude/longitude).",
        rowNumber,
        row,
        "coordonneesXY/consolidated_latitude/consolidated_longitude",
        JSON.stringify({
          coordonneesXY: row.coordonneesXY,
          latitude: row.consolidated_latitude,
          longitude: row.consolidated_longitude,
        }),
      );
    }

    const dateMaj = parseDate(row.date_maj || null);
    const puissanceMax = parseNumber(row.puissance_max || null);
    const gratuit = parseBoolean(row.gratuit || null);
    const paiementActe = parseBoolean(row.paiement_acte || null);
    const paiementCb = parseBoolean(row.paiement_cb || null);
    const paiementAutre = normalizeString(row.paiement_autre || null);
    const tarification = normalizeString(row.tarification || null);
    const conditionAcces = normalizeString(row.condition_acces || null);
    const reservation = parseBoolean(row.reservation || null);
    const horaires = normalizeString(row.horaires || null);
    const accessibilitePmr = normalizeString(row.accessibilite_pmr || null);
    const restrictionGabarit = normalizeString(row.restriction_gabarit || null);
    const stationDeuxRoues = parseBoolean(row.station_deux_roues || null);
    const raccordement = normalizeString(row.raccordement || null);
    const numPdl = normalizeString(row.num_pdl || null);
    const dateMiseEnService = parseDate(row.date_mise_en_service || null);
    const observations = normalizeString(row.observations || null);
    const cableT2Attache = parseBoolean(row.cable_t2_attache || null);
    const lastModified = parseDate(row.last_modified || null);
    const datagouvDatasetId = normalizeString(row.datagouv_dataset_id || null);
    const datagouvResourceId = normalizeString(
      row.datagouv_resource_id || null,
    );
    const datagouvOrganizationOrOwner = normalizeString(
      row.datagouv_organization_or_owner || null,
    );
    const consolidatedCodePostal = normalizeString(
      row.consolidated_code_postal || null,
    );
    const consolidatedCommune = normalizeString(
      row.consolidated_commune || null,
    );
    const consolidatedIsLonLatCorrect = parseBoolean(
      row.consolidated_is_lon_lat_correct || null,
    );
    const consolidatedIsCodeInseeVerified = parseBoolean(
      row.consolidated_is_code_insee_verified || null,
    );
    const consolidatedIsCodeInseeModified = parseBoolean(
      row.consolidated_is_code_insee_modified || null,
    );
    const coordonneesXYString = normalizeString(row.coordonneesXY || null);
    const nbrePdc = parseNumber(row.nbre_pdc || null);

    const idPdcItinerance = normalizeString(row.id_pdc_itinerance || null);
    const idPdcLocal = normalizeString(row.id_pdc_local || null);
    const puissanceNominaleRaw = row.puissance_nominale;
    const puissanceNominale = parseNumber(puissanceNominaleRaw || null);

    // verification de la puissance nominale du terminal
    if (puissanceNominale === null && puissanceNominaleRaw) {
      console.log(
        `[dataTransformer] Ligne #${rowNumber}: Impossible de parser la puissance nominale. Valeur reçue: "${puissanceNominaleRaw}"`,
        LogLevel.WARN,
      );
    }

    const priseType2 = parseBoolean(row.prise_type_2 || null);
    const priseTypeEf = parseBoolean(row.prise_type_ef || null);
    const priseChademo = parseBoolean(row.prise_chademo || null);
    const priseComboCcs = parseBoolean(row.prise_combo_ccs || null);
    const priseAutre = normalizeString(row.prise_type_autre || null);
    const statutPdc = normalizeString(row.statut_pdc || null);

    const amenageurName = normalizeString(row.nom_amenageur || null);
    const operateurName = normalizeString(row.nom_operateur || null);
    const enseigneName = normalizeString(row.nom_enseigne || null);
    const accessName = normalizeString(row.condition_acces || null);

    const idAccess = accessName
      ? await findOrCreateAccessByName(accessName)
      : null;
    const idOperateur = operateurName
      ? await findOrCreateOperatorByName(operateurName)
      : null;
    const idAmenageur = amenageurName
      ? await findOrCreateProviderByName(amenageurName)
      : null;
    const idEnseigne = enseigneName
      ? await findOrCreateCompagnyByName(enseigneName)
      : null;
    const idPower =
      puissanceNominale !== null
        ? await findOrCreatePowerByName(puissanceNominale)
        : null;

    // Validation des champs critiques pour une station
    if (
      !idStationItinerance &&
      (!nomStation ||
        consolidatedLatitude === null ||
        consolidatedLongitude === null)
    ) {
      console.warn(
        `[WARN - dataTransformer] Ligne #${rowNumber}: Données station insuffisantes (id_station_itinerance, nom_station, lat/lon manquants).`,
        LogLevel.WARN,
        row,
      );
      return createTransformError(
        "MISSING_CRITICAL_STATION_DATA",
        "Données d'identification de station manquantes (id_station_itinerance ou nom_station/lat/lon).",
        rowNumber,
        row,
        "id_station_itinerance/nom_station/consolidated_latitude/consolidated_longitude",
        JSON.stringify({
          idStationItinerance,
          nomStation,
          consolidatedLatitude,
          consolidatedLongitude,
        }),
      );
    }

    // Validation des champs critiques pour un terminal
    if (!idPdcItinerance && !idPdcLocal) {
      console.warn(
        `[WARN - dataTransformer] Ligne #${rowNumber}: Données terminal insuffisantes (id_pdc_itinerance et id_pdc_local manquants).`,
        LogLevel.WARN,
        row,
      );
      return createTransformError(
        "MISSING_CRITICAL_TERMINAL_DATA",
        "Données d'identification de terminal manquantes (id_pdc_itinerance ou id_pdc_local).",
        rowNumber,
        row,
        "id_pdc_itinerance/id_pdc_local",
        JSON.stringify({ idPdcItinerance, idPdcLocal }),
      );
    }

    const stationData: Partial<StationAttributes> = {
      id_station_itinerance: idStationItinerance,
      nom_amenageur: amenageurName,
      siren_amenageur: normalizeString(row.siren_amenageur || null),
      contact_amenageur: normalizeString(row.contact_amenageur || null),
      nom_operateur: operateurName,
      contact_operateur: normalizeString(row.contact_operateur || null),
      telephone_operateur: normalizeString(row.telephone_operateur || null),
      nom_enseigne: enseigneName,
      id_station_local: normalizeString(row.id_station_local || null),
      nom_station: nomStation,
      implantation_station: normalizeString(row.implantation_station || null),
      adresse_station: adresseStation,
      code_insee_commune: codeInsee,
      nbre_pdc: nbrePdc,
      puissance_max: puissanceMax,
      gratuit: gratuit,
      paiement_acte: paiementActe,
      paiement_cb: paiementCb,
      paiement_autre: paiementAutre,
      tarification: tarification,
      condition_acces: conditionAcces,
      reservation: reservation,
      horaires: horaires,
      accessibilite_pmr: accessibilitePmr,
      restriction_gabarit: restrictionGabarit,
      station_deux_roues: stationDeuxRoues,
      raccordement: raccordement,
      num_pdl: numPdl,
      date_mise_en_service: dateMiseEnService,
      observations: observations,
      date_maj: dateMaj,
      cable_t2_attache: cableT2Attache,
      last_modified: lastModified,
      datagouv_dataset_id: datagouvDatasetId,
      datagouv_resource_id: datagouvResourceId,
      datagouv_organization_or_owner: datagouvOrganizationOrOwner,
      consolidated_latitude: consolidatedLatitude,
      consolidated_longitude: consolidatedLongitude,
      consolidated_code_postal: consolidatedCodePostal,
      consolidated_commune: consolidatedCommune,
      consolidated_is_lon_lat_correct: consolidatedIsLonLatCorrect,
      consolidated_is_code_insee_verified: consolidatedIsCodeInseeVerified,
      consolidated_is_code_insee_modified: consolidatedIsCodeInseeModified,
      coordonnees_x_y: coordonneesXYString,
      geom: geom,
      id_access: idAccess,
      id_provider: idAmenageur,
      id_operator: idOperateur,
      id_compagny: idEnseigne,
    };

    const terminalData: Partial<TerminalAttributes> = {
      id_pdc_itinerance: idPdcItinerance,
      id_pdc_local: idPdcLocal,
      latitude: consolidatedLatitude,
      longitude: consolidatedLongitude,
      geom: geom,
      type_de_prise: priseAutre || "UNKNOWN",
      puissance_nominale: puissanceNominale || 0,
      prise_type_2: priseType2 || false,
      prise_type_ef: priseTypeEf || false,
      prise_chademo: priseChademo || false,
      prise_combo_ccs: priseComboCcs || false,
      prise_autre: priseAutre,
      status: statutPdc,
      num_pdc: normalizeString(row.num_pdc || null),
      id_power: idPower,
    };

    const plugAssociations: { id_plug: string }[] = [];
    const addedPlugIds = new Set<string>();

    const plugColumnMapping: { [key: string]: string } = {
      prise_type_ef: "Type EF",
      prise_type_2: "Type 2",
      prise_combo_ccs: "Combo CCS",
      prise_chademo: "Chademo",
    };

    for (const columnName in plugColumnMapping) {
      if (Object.prototype.hasOwnProperty.call(row, columnName)) {
        const value = row[columnName as keyof CsvRow];
        if (parseBoolean(value) === true) {
          const plugName = plugColumnMapping[columnName];
          const plugId = await findOrCreatePlugByName(plugName);
          addedPlugIds.add(plugId);
        }
      }
    }

    const validOtherPlugName = getNonBooleanString(row.prise_type_autre);

    if (validOtherPlugName) {
      console.log(
        `[dataTransformer] Ligne #${rowNumber}: Détection d'un nom de prise non standard dans 'prise_type_autre': "${validOtherPlugName}".`,
        LogLevel.INFO,
      );
      const plugId = await findOrCreatePlugByName(validOtherPlugName);
      addedPlugIds.add(plugId);
    }

    // Transformer le Set d'IDs en tableau d'objets pour le résultat final
    for (const plugId of addedPlugIds) {
      plugAssociations.push({ id_plug: plugId });
    }
    console.log(
      `[DEBUG - dataTransformer] Transformation réussie pour la ligne #${rowNumber}.`,
      LogLevel.DEBUG,
    );
    return {
      success: true,
      data: { stationData, terminalData, plugAssociations },
    };
  } catch (error: unknown) {
    console.error(
      `[ERROR - dataTransformer] Erreur inattendue lors de la transformation de la ligne #${rowNumber}:`,
      LogLevel.ERROR,
      error,
    );
    return createTransformError(
      "UNEXPECTED_TRANSFORMATION_ERROR",
      `Une erreur inattendue s'est produite lors de la transformation de la ligne: ${
        error instanceof Error ? error.message : String(error)
      }`,
      rowNumber,
      row,
      undefined,
      undefined,
      error,
    );
  }
}
