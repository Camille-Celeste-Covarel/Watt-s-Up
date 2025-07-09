import type { RequestHandler } from "express";
import sequelize from "../config/database";
import { Station } from "../models/station.model";
import { Terminal } from "../models/terminal.model";

// L'opération BREAD : Browse (Read All)
// Récupère toutes les ressources.
const browse: RequestHandler = async (_req, res, next) => {
  try {
    const stations = await Station.findAll({
      attributes: [
        "id",
        "id_station_itinerance",
        "id_access",
        "id_provider",
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
        "last_modified",
        "consolidated_Bbox",
        "consolidated_code_postal",
        "consolidated_commune",
        "consolidated_is_free",
        "consolidated_moyen_paiement",
        "consolidated_photo",
        "consolidated_region",
        "consolidated_tarification",
        "consolidated_departement",
        "consolidated_code_departement",
        "consolidated_code_region",
        "geom",
        [sequelize.fn("ST_AsGeoJSON", sequelize.col("geom")), "geojson_geom"],
        [sequelize.fn("ST_Y", sequelize.col("geom")), "latitude"],
        [sequelize.fn("ST_X", sequelize.col("geom")), "longitude"],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM terminal WHERE terminal.id_station = Station.id AND terminal.is_booked = FALSE)",
          ),
          "availableTerminalsCount",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM terminal WHERE terminal.id_station = Station.id)",
          ),
          "totalTerminalsCount",
        ],
      ],
      include: [
        {
          model: Terminal,
          as: "terminals",
          attributes: [
            "id",
            "type_de_prise",
            "puissance_nominale",
            "is_booked",
            "status",
          ],
          required: false,
        },
      ],
    });
    res.json(stations);
    return;
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Browse Visible (Read All visible in bbox)
const browseVisible: RequestHandler = async (req, res, next) => {
  try {
    const { bbox } = req.query;
    if (!bbox || typeof bbox !== "string") {
      res.status(400).json({ error: "Bounding box (bbox) is required." });
      return;
    }

    const bboxParts = bbox.split(",").map(Number);
    if (bboxParts.length !== 4) {
      res.status(400).json({
        error: "Bounding box (bbox) must have 4 comma-separated numbers.",
      });
      return;
    }
    const [west, south, east, north] = bboxParts;

    if (
      Number.isNaN(west) ||
      Number.isNaN(south) ||
      Number.isNaN(east) ||
      Number.isNaN(north) ||
      west > east ||
      south > north
    ) {
      res.status(400).json({ error: "Invalid bbox coordinates." });
      return;
    }

    const stations = await Station.findAll({
      attributes: [
        "id",
        "nom_station",
        "adresse_station",
        "condition_acces",
        [
          sequelize.fn("ST_AsGeoJSON", sequelize.col("Station.geom")),
          "geojson_geom",
        ],
        [sequelize.fn("ST_Y", sequelize.col("Station.geom")), "latitude"],
        [sequelize.fn("ST_X", sequelize.col("Station.geom")), "longitude"],
        [
          sequelize.literal(
            `COUNT(CASE WHEN "terminals"."is_booked" = FALSE THEN 1 ELSE NULL END)`,
          ),
          "availableTerminalsCount",
        ],
        [sequelize.literal(`COUNT("terminals"."id")`), "totalTerminalsCount"],
      ],
      include: [
        {
          model: Terminal,
          as: "terminals",
          attributes: [],
          required: false,
        },
      ],
      where: sequelize.literal(
        `ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326) && "Station"."geom"`,
      ),
      group: ["Station.id", "Station.geom"],
    });

    res.json(stations);
    return;
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Read (Read One)
const read: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id, {
      include: [
        {
          model: Terminal,
          as: "terminals",
          attributes: [
            "id",
            "type_de_prise",
            "puissance_nominale",
            "is_booked",
            "status",
          ],
        },
      ],

      attributes: [
        "id",
        "id_station_itinerance",
        "id_access",
        "id_provider",
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
        "last_modified",
        "consolidated_Bbox",
        "consolidated_code_postal",
        "consolidated_commune",
        "consolidated_is_free",
        "consolidated_moyen_paiement",
        "consolidated_photo",
        "consolidated_region",
        "consolidated_tarification",
        "consolidated_departement",
        "consolidated_code_departement",
        "consolidated_code_region",
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
    return;
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Add (Create)
const add: RequestHandler = async (req, res, next) => {
  try {
    const newStation = await Station.create(req.body);
    res.status(201).json(newStation);
    return;
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Edit (Update)
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
    return;
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Destroy (Delete)
const destroy: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRowCount = await Station.destroy({
      where: { id },
    });
    if (deletedRowCount === 0) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
    return;
  } catch (err) {
    next(err);
  }
};

export default {
  browse,
  browseVisible,
  read,
  add,
  edit,
  destroy,
};
