import type * as GeoJSON from "geojson";
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

function createTransformError(
  type: string,
  message: string,
  rowNumber: number,
  rowData: CsvRow,
  columnName?: string,
  culpritValue?: string,
  originalError?: unknown,
): { success: false; error: TransformError } {
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
  try {
    const idStationItinerance = normalizeString(row.id_station_itinerance);
    const idStationLocal = normalizeString(row.id_station_local);
    const idTerminalItinerance = normalizeString(row.id_pdc_itinerance);
    const idTerminalLocal = normalizeString(row.id_pdc_local);

    if (!idTerminalItinerance) {
      return createTransformError(
        "MISSING_TERMINAL_ID",
        "ID de terminal (id_pdc_itinerance) manquant.",
        rowNumber,
        row,
        "id_pdc_itinerance",
        row.id_pdc_itinerance,
      );
    }

    const stationName = normalizeString(row.nom_station);
    if (!stationName) {
      return createTransformError(
        "MISSING_STATION_NAME",
        "Nom de station (nom_station) manquant.",
        rowNumber,
        row,
        "nom_station",
        row.nom_station,
      );
    }

    const amenageurName = normalizeString(row.nom_amenageur);
    const operateurName = normalizeString(row.nom_operateur);
    const compagnyName = normalizeString(row.nom_enseigne);

    const accessName = normalizeString(row.condition_acces);
    const providerName = normalizeString(row.nom_amenageur);

    const puissanceNominaleTerminal = parseNumber(row.puissance_nominale);
    if (puissanceNominaleTerminal === null) {
      return createTransformError(
        "INVALID_POWER_VALUE",
        "La puissance nominale (puissance_nominale) n'est pas un nombre valide.",
        rowNumber,
        row,
        "puissance_nominale",
        row.puissance_nominale,
      );
    }

    // Gestion des coordonnées
    let geom: GeoJSON.Point | null = null;
    let consolidatedLatitude: number | null = null;
    let consolidatedLongitude: number | null = null;

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
      geom = parseSeparateGeoJSONCoordinates(
        row.consolidated_latitude,
        row.consolidated_longitude,
      );
      if (geom) {
        [consolidatedLongitude, consolidatedLatitude] = geom.coordinates;
      } else {
        return createTransformError(
          "INVALID_COORDINATES",
          "Coordonnées latitude/longitude invalides.",
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

    if (consolidatedLatitude === null || consolidatedLongitude === null) {
      return createTransformError(
        "COORDINATES_PARSING_FAILED",
        "Échec de l'extraction des coordonnées consolidées après parsing.",
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

    const stationData: Partial<StationAttributes> = {
      id_station_itinerance: idStationItinerance,
      id_station_local: idStationLocal,
      nom_station: stationName,
      siren_amenageur: normalizeString(row.siren_amenageur),
      nom_amenageur: amenageurName,
      nom_operateur: operateurName,
      nom_enseigne: compagnyName,
      adresse_station: normalizeString(row.adresse_station),
      code_insee_commune: normalizeString(row.code_insee_commune),
      nbre_pdc: parseNumber(row.nbre_pdc),
      gratuit: parseBoolean(row.gratuit),
      paiement_acte: parseBoolean(row.paiement_acte),
      paiement_cb: parseBoolean(row.paiement_cb),
      paiement_autre: normalizeString(row.paiement_autre),
      tarification: normalizeString(row.tarification),
      condition_acces: normalizeString(row.condition_acces),
      reservation: parseBoolean(row.reservation),
      horaires: normalizeString(row.horaires),
      accessibilite_pmr: normalizeString(row.accessibilite_pmr),
      restriction_gabarit: normalizeString(row.restriction_gabarit),
      station_deux_roues: parseBoolean(row.station_deux_roues),
      raccordement: normalizeString(row.raccordement),
      num_pdl: normalizeString(row.num_pdl),
      date_mise_en_service: parseDate(row.date_mise_en_service),
      observations: normalizeString(row.observations),
      date_maj: parseDate(row.date_maj),
      cable_t2_attache: parseBoolean(row.cable_t2_attache),
      last_modified: parseDate(row.last_modified),
      datagouv_dataset_id: normalizeString(row.datagouv_dataset_id),
      datagouv_resource_id: normalizeString(row.datagouv_resource_id),
      datagouv_organization_or_owner: normalizeString(
        row.datagouv_organization_or_owner,
      ),
      consolidated_latitude: consolidatedLatitude,
      consolidated_longitude: consolidatedLongitude,
      consolidated_code_postal: normalizeString(row.consolidated_code_postal),
      consolidated_commune: normalizeString(row.consolidated_commune),
      consolidated_is_lon_lat_correct: parseBoolean(
        row.consolidated_is_lon_lat_correct,
      ),
      consolidated_is_code_insee_verified: parseBoolean(
        row.consolidated_is_code_insee_verified,
      ),
      consolidated_is_code_insee_modified: parseBoolean(
        row.consolidated_is_code_insee_modified,
      ),
      coordonneesXY: normalizeString(row.coordonneesXY),
      geom: geom,
      id_access: accessName ? await findOrCreateAccessByName(accessName) : null,
      id_provider: providerName
        ? await findOrCreateProviderByName(providerName)
        : null,
      id_operator: operateurName
        ? await findOrCreateOperatorByName(operateurName)
        : null,
      id_compagny: compagnyName
        ? await findOrCreateCompagnyByName(compagnyName)
        : null,
    };

    const priseAutre = normalizeString(row.prise_type_autre);
    const priseType2 = parseBoolean(row.prise_type_2);
    const priseTypeEf = parseBoolean(row.prise_type_ef);
    const priseChademo = parseBoolean(row.prise_type_chademo);
    const priseComboCcs = parseBoolean(row.prise_type_combo_ccs);

    const terminalData: Partial<TerminalAttributes> = {
      id_pdc_itinerance: idTerminalItinerance,
      id_pdc_local: idTerminalLocal,
      id_power:
        puissanceNominaleTerminal !== null
          ? await findOrCreatePowerByName(puissanceNominaleTerminal)
          : null,
      latitude: consolidatedLatitude,
      longitude: consolidatedLongitude,
      geom: geom,
      status: normalizeString(row.statut_pdc || "UNKNOWN"),

      puissance_nominale: puissanceNominaleTerminal || 0,
      type_de_prise: priseAutre || "UNKNOWN",
      prise_type_2: priseType2 || false,
      prise_type_ef: priseTypeEf || false,
      prise_chademo: priseChademo || false,
      prise_combo_ccs: priseComboCcs || false,
      prise_autre: priseAutre,
    };

    const plugAssociations: { id_plug: string }[] = [];

    if (priseTypeEf)
      plugAssociations.push({
        id_plug: await findOrCreatePlugByName("Type EF"),
      });
    if (priseType2)
      plugAssociations.push({
        id_plug: await findOrCreatePlugByName("Type 2"),
      });
    if (priseComboCcs)
      plugAssociations.push({
        id_plug: await findOrCreatePlugByName("Combo CCS"),
      });
    if (priseChademo)
      plugAssociations.push({
        id_plug: await findOrCreatePlugByName("Chademo"),
      });

    if (priseAutre && priseAutre !== "false") {
      const idAutrePlug = await findOrCreatePlugByName(priseAutre);
      if (!plugAssociations.some((p) => p.id_plug === idAutrePlug)) {
        plugAssociations.push({ id_plug: idAutrePlug });
      }
    }

    return {
      success: true,
      data: { stationData, terminalData, plugAssociations },
    };
  } catch (error: unknown) {
    return createTransformError(
      "UNEXPECTED_TRANSFORMATION_ERROR",
      `Erreur inattendue lors de la transformation de la ligne: ${error instanceof Error ? error.message : String(error)}.`,
      rowNumber,
      row,
      undefined,
      undefined,
      error,
    );
  }
}
