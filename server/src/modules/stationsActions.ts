import type { RequestHandler } from "express";
import sequelize from "../config/database";
import { Station } from "../models/station.model";

// L'opération BREAD : Browse (Read All)
// Récupère toutes les ressources.
const browse: RequestHandler = async (req, res, next) => {
  try {
    const stations = await Station.findAll({
      attributes: [
        "id",
        "id_station_itinerance",
        "id_access",
        "id_provider",
        "id_book",
        "nom_amenageur",
        "siren_amenageur",
        "contact_amenageur",
        "nom_operateur",
        "id_operator",
        "contact_operateur",
        "telephone_operateur",
        "nom_enseigne",
        "id_compagny",
        "id_station_local",
        "nom_station",
        "implantation_station",
        "adresse_station",
        "code_insee_commune",
        "nbre_pdc",
        "puissance_max",
        "gratuit",
        "paiement_acte",
        "paiement_cb",
        "paiement_autre",
        "tarification",
        "condition_acces",
        "reservation",
        "horaires",
        "accessibilite_pmr",
        "restriction_gabarit",
        "station_deux_roues",
        "raccordement",
        "num_pdl",
        "date_mise_en_service",
        "observations",
        "date_maj",
        "cable_t2_attache",
        "last_modified",
        "datagouv_dataset_id",
        "datagouv_resource_id",
        "datagouv_organization_or_owner",
        "consolidated_code_postal",
        "consolidated_commune",
        "consolidated_is_lon_lat_correct",
        "consolidated_is_code_insee_verified",
        "consolidated_is_code_insee_modified",
        "coordonneesXY",
        [sequelize.fn("ST_AsGeoJSON", sequelize.col("geom")), "geojson_geom"],
        [sequelize.fn("ST_Y", sequelize.col("geom")), "latitude"],
        [sequelize.fn("ST_X", sequelize.col("geom")), "longitude"],
      ],
    });
    res.json(stations);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Read (Read One)
// Récupère une ressource spécifique par son ID.
const read: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id, {
      attributes: [
        "id",
        "id_station_itinerance",
        "id_access",
        "id_provider",
        "id_book",
        "nom_amenageur",
        "siren_amenageur",
        "contact_amenageur",
        "nom_operateur",
        "id_operator",
        "contact_operateur",
        "telephone_operateur",
        "nom_enseigne",
        "id_compagny",
        "id_station_local",
        "nom_station",
        "implantation_station",
        "adresse_station",
        "code_insee_commune",
        "nbre_pdc",
        "puissance_max",
        "gratuit",
        "paiement_acte",
        "paiement_cb",
        "paiement_autre",
        "tarification",
        "condition_acces",
        "reservation",
        "horaires",
        "accessibilite_pmr",
        "restriction_gabarit",
        "station_deux_roues",
        "raccordement",
        "num_pdl",
        "date_mise_en_service",
        "observations",
        "date_maj",
        "cable_t2_attache",
        "last_modified",
        "datagouv_dataset_id",
        "datagouv_resource_id",
        "datagouv_organization_or_owner",
        "consolidated_code_postal",
        "consolidated_commune",
        "consolidated_is_lon_lat_correct",
        "consolidated_is_code_insee_verified",
        "consolidated_is_code_insee_modified",
        "coordonneesXY",
        [sequelize.fn("ST_AsGeoJSON", sequelize.col("geom")), "geojson_geom"],
        [sequelize.fn("ST_Y", sequelize.col("geom")), "latitude"],
        [sequelize.fn("ST_X", sequelize.col("geom")), "longitude"],
      ],
    });

    if (!station) {
      res.sendStatus(404);
      return;
    }

    res.json(station);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Add (Create)
// Ajoute une nouvelle ressource.
const add: RequestHandler = async (req, res, next) => {
  try {
    const newStation = await Station.create(req.body);
    res.status(201).json(newStation);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Edit (Update)
// Met à jour une ressource existante par son ID.
const edit: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Station.update(req.body, {
      where: { id },
    });
    if (updatedRowsCount === 0) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Destroy (Delete)
// Supprime une ressource par son ID.
const destroy: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Station.destroy({ where: { id } });

    if (deletedRowsCount === 0) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default { browse, read, add, edit, destroy };
