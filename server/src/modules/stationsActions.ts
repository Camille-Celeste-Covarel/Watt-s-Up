import type { RequestHandler } from "express";
import type { IncludeOptions, WhereOptions } from "sequelize";
import { Op } from "sequelize";
import sequelize from "../config/database";
import { Plug } from "../models/plug.model";
import { Power } from "../models/power.model";
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
        "geom",
        [
          sequelize.fn("ST_AsGeoJSON", sequelize.col("Station.geom")),
          "geojson_geom",
        ],
        [sequelize.fn("ST_Y", sequelize.col("Station.geom")), "latitude"],
        [sequelize.fn("ST_X", sequelize.col("Station.geom")), "longitude"],
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
    const { bbox, vehicles, powers, plugs } = req.query;

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

    const whereConditions: Array<
      object | ReturnType<typeof sequelize.literal>
    > = [
      sequelize.literal(
        `ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326) && "Station"."geom"`,
      ),
    ];

    // ✅ Filtrage par véhicules (deux roues)
    if (vehicles && typeof vehicles === "string") {
      const vehicleList = vehicles.split(",");

      if (vehicleList.includes("bike")) {
        whereConditions.push({ station_deux_roues: true });
      }
    }

    const includeTerminals: IncludeOptions[] = [];

    const terminalInclude: IncludeOptions = {
      model: Terminal,
      as: "terminals",
      attributes: [],
      required: false,
    };

    // ✅ Filtrage par puissance - Version directe
    if (powers && typeof powers === "string") {
      const powerList = powers.split(",");
      const powerConditions: WhereOptions[] = [];

      if (powerList.includes("slow")) {
        powerConditions.push({ puissance_nominale: { [Op.lte]: 7.4 } });
      }
      if (powerList.includes("accelerated")) {
        powerConditions.push({
          puissance_nominale: {
            [Op.and]: [{ [Op.gt]: 7.4 }, { [Op.lte]: 22.08 }],
          },
        });
      }
      if (powerList.includes("fast")) {
        powerConditions.push({
          puissance_nominale: {
            [Op.and]: [{ [Op.gt]: 22.08 }, { [Op.lte]: 150 }],
          },
        });
      }
      if (powerList.includes("ultrafast")) {
        powerConditions.push({ puissance_nominale: { [Op.gt]: 150 } });
      }

      if (powerConditions.length > 0) {
        const existingWhere = (terminalInclude.where as WhereOptions) || {};

        terminalInclude.where = {
          ...existingWhere,
          [Op.or]: powerConditions,
        } as WhereOptions;

        terminalInclude.required = true;
      }
    }

    // ✅ Filtrage par prises
    if (plugs && typeof plugs === "string") {
      const plugList = plugs.split(",");
      const plugConditions: WhereOptions[] = [];

      if (plugList.includes("chademo")) {
        plugConditions.push({ prise_chademo: true });
      }
      if (plugList.includes("combo-css")) {
        plugConditions.push({ prise_combo_ccs: true });
      }
      if (plugList.includes("type-ef")) {
        plugConditions.push({ prise_type_ef: true });
      }
      if (plugList.includes("type-2")) {
        plugConditions.push({ prise_type_2: true });
      }

      if (plugConditions.length > 0) {
        const existingWhere = (terminalInclude.where as WhereOptions) || {};

        terminalInclude.where = {
          ...existingWhere,
          [Op.and]: [existingWhere, { [Op.or]: plugConditions }],
        } as WhereOptions;

        terminalInclude.required = true;
      }
    }

    if (terminalInclude.required || terminalInclude.where) {
      includeTerminals.push(terminalInclude);
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
            `(SELECT COUNT(*) FROM terminal WHERE terminal.id_station = "Station".id AND terminal.is_booked = FALSE)`,
          ),
          "availableTerminalsCount",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM terminal WHERE terminal.id_station = "Station".id)`,
          ),
          "totalTerminalsCount",
        ],
      ],
      where: sequelize.and(...whereConditions),
      include: includeTerminals,
      group:
        includeTerminals.length > 0
          ? [
              "Station.id",
              "Station.nom_station",
              "Station.adresse_station",
              "Station.condition_acces",
              "Station.geom",
            ]
          : undefined,
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
          attributes: ["id", "puissance_nominale", "is_booked", "status"],
          include: [
            {
              model: Plug,
              as: "plugs",
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
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
        [
          sequelize.fn("ST_AsGeoJSON", sequelize.col("Station.geom")),
          "geojson_geom",
        ],
        [sequelize.fn("ST_Y", sequelize.col("Station.geom")), "latitude"],
        [sequelize.fn("ST_X", sequelize.col("Station.geom")), "longitude"],
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
