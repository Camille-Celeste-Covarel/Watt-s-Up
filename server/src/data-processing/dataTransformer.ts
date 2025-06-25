import type * as GeoJSON from "geojson";
import type { CsvRow } from "../types/dataProcessing/dataProcessing";
import type { TransformResult } from "../types/dataProcessing/importProcessingTypes";
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

export async function transformCsvRowToEntities(
  row: CsvRow,
  rowNumber: number,
): Promise<TransformResult> {
  try {
    const idStationItinerance = normalizeString(row.id_station_itinerance);
    const idStationLocal = normalizeString(row.id_station_local);
    const idTerminalItinerance = normalizeString(row.id_pdc_itinerance);
    const idTerminalLocal = normalizeString(row.id_pdc_local);

    if (!idTerminalItinerance) {
      return {
        success: false,
        error: {
          type: "MISSING_TERMINAL_ID",
          message: "ID de terminal (id_pdc_itinerance) manquant.",
          rowNumber: rowNumber,
          rowData: row,
        },
      };
    }

    const stationName = normalizeString(row.nom_station || row.nom_enseigne);
    const implantationStation = normalizeString(row.implantation_station);
    const adresseStation = normalizeString(row.adresse_station);
    const codeInseeCommune = normalizeString(row.code_insee_commune);
    const nbrePdc = parseNumber(row.nbre_pdc);
    const gratuit = parseBoolean(row.gratuit);
    const paiementActe = parseBoolean(row.paiement_acte);
    const paiementCb = parseBoolean(row.paiement_cb);
    const paiementAutre = normalizeString(row.paiement_autre);
    const tarification = normalizeString(row.tarification);
    const conditionAcces = normalizeString(row.condition_acces);
    const reservation = parseBoolean(row.reservation);
    const horaires = normalizeString(row.horaires);
    const accessibilitePmr = normalizeString(row.accessibilite_pmr);
    const restrictionGabarit = normalizeString(row.restriction_gabarit);
    const stationDeuxRoues = parseBoolean(row.station_deux_roues);
    const raccordement = normalizeString(row.raccordement);
    const numPdl = normalizeString(row.num_pdl);
    const dateMiseEnService = parseDate(row.date_mise_en_service);
    const observations = normalizeString(row.observations);
    const dateMaj = parseDate(row.date_maj);
    const cableT2Attache = parseBoolean(row.cable_t2_attache);
    const lastModified = parseDate(row.last_modified);
    const datagouvDatasetId = normalizeString(row.datagouv_dataset_id);
    const datagouvResourceId = normalizeString(row.datagouv_resource_id);
    const datagouvOrganizationOrOwner = normalizeString(
      row.datagouv_organization_or_owner,
    );
    const createdAt = parseDate(row.created_at);
    const consolidatedCodePostal = normalizeString(
      row.consolidated_code_postal,
    );
    const consolidatedCommune = normalizeString(row.consolidated_commune);
    const consolidatedIsLonLatCorrect = parseBoolean(
      row.consolidated_is_lon_lat_correct,
    );
    const consolidatedIsCodeInseeVerified = parseBoolean(
      row.consolidated_is_code_insee_verified,
    );
    const consolidatedIsCodeInseeModified = parseBoolean(
      row.consolidated_is_code_insee_modified,
    );

    let geoJsonPoint: GeoJSON.Point | null = null;

    if (row.coordonneesXY) {
      geoJsonPoint = parseGeoJSONPoint(row.coordonneesXY);
    }

    if (
      !geoJsonPoint &&
      (row.consolidated_latitude || row.consolidated_longitude)
    ) {
      geoJsonPoint = parseSeparateGeoJSONCoordinates(
        row.consolidated_latitude,
        row.consolidated_longitude,
      );
    }

    if (!geoJsonPoint) {
      return {
        success: false,
        error: {
          type: "INVALID_GEOMETRY",
          message: "Coordonnées géographiques invalides ou manquantes.",
          rowNumber: rowNumber,
          rowData: row,
        },
      };
    }

    const latitude = geoJsonPoint.coordinates[1];
    const longitude = geoJsonPoint.coordinates[0];

    const puissanceNominaleTerminal = parseNumber(row.puissance_nominale);
    const priseType2 = parseBoolean(row.prise_type_2);
    const priseTypeEf = parseBoolean(row.prise_type_ef);
    const priseChademo = parseBoolean(row.prise_type_chademo);
    const priseComboCcs = parseBoolean(row.prise_type_combo_ccs);
    const priseAutre = normalizeString(row.prise_type_autre);

    const idAccess = await findOrCreateAccessByName(
      conditionAcces || "Inconnu",
    );
    const idCompagny = await findOrCreateCompagnyByName(
      normalizeString(row.nom_amenageur) || "Inconnu",
    );
    const idOperator = await findOrCreateOperatorByName(
      normalizeString(row.nom_operateur) || "Inconnu",
    );
    const idProvider = await findOrCreateProviderByName(
      normalizeString(row.nom_enseigne) || "Inconnu",
    );
    const idPower = await findOrCreatePowerByName(
      puissanceNominaleTerminal || 0,
    );

    const stationData: Partial<StationAttributes> = {
      nom_station: stationName || "UNKNOWN_STATION_NAME",
      consolidated_latitude: latitude,
      consolidated_longitude: longitude,
      geom: geoJsonPoint,
      id_station_itinerance: idStationItinerance,
      id_station_local: idStationLocal,
      id_access: idAccess,
      id_operator: idOperator,
      id_compagny: idCompagny,
      id_provider: idProvider,
      nom_amenageur: normalizeString(row.nom_amenageur),
      siren_amenageur: normalizeString(row.siren_amenageur),
      contact_amenageur: normalizeString(row.contact_amenageur),
      nom_operateur: normalizeString(row.nom_operateur),
      contact_operateur: normalizeString(row.contact_operateur),
      telephone_operateur: normalizeString(row.telephone_operateur),
      nom_enseigne: normalizeString(row.nom_enseigne),
      adresse_station: adresseStation,
      code_insee_commune: codeInseeCommune,
      implantation_station: implantationStation,
      nbre_pdc: nbrePdc,
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
      createdAt: createdAt || new Date(),
      consolidated_code_postal: consolidatedCodePostal,
      consolidated_commune: consolidatedCommune,
      consolidated_is_lon_lat_correct: consolidatedIsLonLatCorrect,
      consolidated_is_code_insee_verified: consolidatedIsCodeInseeVerified,
      consolidated_is_code_insee_modified: consolidatedIsCodeInseeModified,
      coordonneesXY: normalizeString(row.coordonneesXY),
    };

    const terminalData: Partial<TerminalAttributes> = {
      id_pdc_itinerance: idTerminalItinerance,
      id_pdc_local: idTerminalLocal,
      id_power: idPower,
      latitude: latitude,
      longitude: longitude,
      geom: geoJsonPoint,
      status: "unknown",

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
    return {
      success: false,
      error: {
        type: "TRANSFORMATION_ERROR",
        message: `Erreur lors de la transformation: ${(error as Error).message}`,
        rowNumber: rowNumber,
        rowData: row,
        details: error,
      },
    };
  }
}
