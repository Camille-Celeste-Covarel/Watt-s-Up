import type { RequestHandler } from "express";
import type { IncludeOptions, WhereOptions } from "sequelize";
import { Op } from "sequelize";
import sequelize from "../config/database";
import { Plug } from "../models/plug.model";
import { Station } from "../models/station.model";
import { Terminal } from "../models/terminal.model";
import type {
  RawStationData,
  TerminalCount,
} from "../types/routes/routesTypes";

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
            '(SELECT COUNT(*) FROM terminal WHERE terminal.id_station = "Station".id AND terminal.is_booked = FALSE)',
          ),
          "availableTerminalsCount",
        ],
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM terminal WHERE terminal.id_station = "Station".id)',
          ),
          "totalTerminalsCount",
        ],
      ],
      include: [
        {
          model: Terminal,
          as: "terminals",
          attributes: ["id", "puissance_nominale", "is_booked", "status"],
          required: false,
        },
      ],
    });
    res.json(stations);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Browse Visible (Read All visible in bbox)
const browseVisible: RequestHandler = async (req, res, next) => {
  try {
    const { bbox, vehicles, powers, plugs, zoom } = req.query;
    const currentZoom = Number.parseFloat(zoom as string) || 0;
    const CLUSTER_ZOOM_THRESHOLD = 14;

    if (!bbox || typeof bbox !== "string") {
      res.status(400).json({ error: "Bounding box (bbox) is required." });
      return;
    }
    const bboxParts = bbox.split(",").map(Number);
    if (
      bboxParts.length !== 4 ||
      bboxParts.some(Number.isNaN) ||
      bboxParts[0] > bboxParts[2] ||
      bboxParts[1] > bboxParts[3]
    ) {
      res.status(400).json({ error: "Invalid bbox coordinates." });
      return;
    }
    const [west, south, east, north] = bboxParts;

    // --- ÉTAPE 1 : Obtenir les IDs des stations (inchangée) ---
    const filterOptions: {
      where: {
        [Op.and]: (WhereOptions | ReturnType<typeof sequelize.literal>)[];
      };
      include: IncludeOptions[];
    } = {
      where: {
        [Op.and]: [
          sequelize.literal(
            `ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326) && "Station"."geom"`,
          ),
        ],
      },
      include: [],
    };

    // Logique de filtres (inchangée)
    if (vehicles && typeof vehicles === "string" && vehicles.includes("bike")) {
      filterOptions.where[Op.and].push({ station_deux_roues: true });
    }
    const terminalInclude: IncludeOptions = {
      model: Terminal,
      as: "terminals",
      attributes: [],
      required: true,
      where: { [Op.and]: [] },
      include: [],
    };
    let isTerminalFilterApplied = false;
    if (powers && typeof powers === "string") {
      const powerList = powers.split(",");
      const powerConditions: WhereOptions[] = [];
      if (powerList.includes("slow"))
        powerConditions.push({ puissance_nominale: { [Op.lte]: 7.4 } });
      if (powerList.includes("accelerated"))
        powerConditions.push({
          puissance_nominale: { [Op.between]: [7.41, 22.08] },
        });
      if (powerList.includes("fast"))
        powerConditions.push({
          puissance_nominale: { [Op.between]: [22.09, 150] },
        });
      if (powerList.includes("ultrafast"))
        powerConditions.push({ puissance_nominale: { [Op.gt]: 150 } });
      if (powerConditions.length > 0) {
        (terminalInclude.where as { [Op.and]: WhereOptions[] })[Op.and].push({
          [Op.or]: powerConditions,
        });
        isTerminalFilterApplied = true;
      }
    }
    if (plugs && typeof plugs === "string") {
      const plugList = plugs.split(",");
      if (plugList.length > 0) {
        const plugNameMapping: { [key: string]: string } = {
          chademo: "Chademo",
          "combo-css": "Combo CCS",
          "type-ef": "Type EF",
          "type-2": "Type 2",
        };
        const mappedPlugs = plugList.map((p) => plugNameMapping[p] || p);
        (terminalInclude.include as IncludeOptions[]).push({
          model: Plug,
          as: "plugs",
          attributes: [],
          required: true,
          where: { name: { [Op.in]: mappedPlugs } },
        });
        isTerminalFilterApplied = true;
      }
    }
    if (isTerminalFilterApplied) {
      filterOptions.include.push(terminalInclude);
    }

    const matchingStations = await Station.findAll({
      attributes: ["id"],
      where: filterOptions.where,
      include: filterOptions.include,
      group: ["Station.id"],
      raw: true,
    });

    const stationIds = matchingStations.map((s) => s.id);

    if (stationIds.length === 0) {
      res.json([]);
      return;
    }

    // --- NOUVELLE LOGIQUE CONDITIONNELLE BASÉE SUR LE ZOOM ---
    // Si nous sommes en vue cluster, nous n'avons besoin que de la géométrie.
    // C'est beaucoup plus rapide car on évite la requête sur les terminaux.
    if (currentZoom <= CLUSTER_ZOOM_THRESHOLD) {
      const stationsGeom = await Station.findAll({
        attributes: [
          "id",
          [
            sequelize.fn("ST_AsGeoJSON", sequelize.col("Station.geom")),
            "geojson_geom",
          ],
        ],
        where: {
          id: { [Op.in]: stationIds },
        },
        raw: true,
      });
      res.json(stationsGeom);
      return;
    }

    // ÉTAPE 2 : Récupérer les compteurs en une seule requête
    const terminalCounts = await Terminal.findAll({
      attributes: [
        "id_station",
        [sequelize.fn("COUNT", sequelize.col("id")), "totalTerminalsCount"],
        [
          sequelize.literal(`COUNT(CASE WHEN "is_booked" = FALSE THEN 1 END)`),
          "availableTerminalsCount",
        ],
      ],
      where: {
        id_station: { [Op.in]: stationIds },
      },
      group: ["id_station"],
      raw: true,
    });

    // Créer une map pour un accès instantané aux compteurs
    const countsMap = new Map<string, { total: number; available: number }>();
    for (const count of terminalCounts as unknown as TerminalCount[]) {
      countsMap.set(count.id_station, {
        total: Number.parseInt(count.totalTerminalsCount, 10),
        available: Number.parseInt(count.availableTerminalsCount, 10),
      });
    }

    // ÉTAPE 3 : Récupérer les données des stations SANS les sous-requêtes
    const stationsData = await Station.findAll({
      attributes: [
        "id",
        [
          sequelize.fn("ST_AsGeoJSON", sequelize.col("Station.geom")),
          "geojson_geom",
        ],
      ],
      where: {
        id: { [Op.in]: stationIds },
      },
      raw: true,
    });

    // ÉTAPE 4 : Assembler les données en JavaScript
    const finalStations = (stationsData as unknown as RawStationData[]).map(
      (station) => {
        const counts = countsMap.get(station.id) || { total: 0, available: 0 };
        return {
          ...station,
          totalTerminalsCount: counts.total,
          availableTerminalsCount: counts.available,
        };
      },
    );

    res.json(finalStations);
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
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Add (Create)
const add: RequestHandler = async (req, res, next) => {
  try {
    const newStation = await Station.create(req.body);
    res.status(201).json(newStation);
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
