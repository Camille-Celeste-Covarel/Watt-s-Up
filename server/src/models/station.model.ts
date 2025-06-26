import type * as GeoJSON from "geojson";
import { DataTypes, Model, Op, type Sequelize } from "sequelize";
import type {
  StationAttributes,
  StationCreationAttributes,
} from "../types/models/models";

import { Access } from "./access.model";
import { Book } from "./book.model";
import { Compagny } from "./compagny.model";
import { Operator } from "./operator.model";
import { Provider } from "./provider.model";
import { Terminal } from "./terminal.model";

export class Station
  extends Model<StationAttributes, StationCreationAttributes>
  implements StationAttributes
{
  public id!: string;
  public id_station_itinerance!: string | null;
  public id_access!: string | null;
  public id_provider!: string | null;
  public id_book!: string | null;
  public nom_amenageur!: string | null;
  public siren_amenageur!: string | null;
  public contact_amenageur!: string | null;
  public nom_operateur!: string | null;
  public id_operator!: string | null;
  public contact_operateur!: string | null;
  public telephone_operateur!: string | null;
  public nom_enseigne!: string | null;
  public id_compagny!: string | null;
  public id_station_local!: string | null;
  public nom_station!: string;
  public implantation_station!: string | null;
  public adresse_station!: string | null;
  public code_insee_commune!: string | null;
  public nbre_pdc?: number | null;
  public gratuit!: boolean | null;
  public paiement_acte!: boolean | null;
  public paiement_cb!: boolean | null;
  public paiement_autre!: string | null;
  public tarification!: string | null;
  public condition_acces!: string | null;
  public reservation!: boolean | null;
  public horaires!: string | null;
  public accessibilite_pmr!: string | null;
  public restriction_gabarit!: string | null;
  public station_deux_roues!: boolean | null;
  public raccordement!: string | null;
  public num_pdl!: string | null;
  public date_mise_en_service!: Date | null;
  public observations!: string | null;
  public date_maj!: Date | null;
  public cable_t2_attache!: boolean | null;
  public last_modified!: Date | null;
  public datagouv_dataset_id!: string | null;
  public datagouv_resource_id!: string | null;
  public datagouv_organization_or_owner!: string | null;
  public consolidated_latitude!: number | null;
  public consolidated_longitude!: number | null;
  public consolidated_code_postal!: string | null;
  public consolidated_commune!: string | null;
  public consolidated_is_lon_lat_correct!: boolean | null;
  public consolidated_is_code_insee_verified!: boolean | null;
  public consolidated_is_code_insee_modified!: boolean | null;
  public coordonneesXY!: string | null;
  public geom!: GeoJSON.Point | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Station.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        id_station_itinerance: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        id_access: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: Access,
            key: "id",
          },
        },
        id_provider: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: Provider,
            key: "id",
          },
        },
        id_book: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: Book,
            key: "id",
          },
        },
        nom_amenageur: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        siren_amenageur: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        contact_amenageur: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        nom_operateur: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        id_operator: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: Operator,
            key: "id",
          },
        },
        contact_operateur: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        telephone_operateur: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        nom_enseigne: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        id_compagny: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: Compagny,
            key: "id",
          },
        },
        id_station_local: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        nom_station: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        implantation_station: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        adresse_station: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        code_insee_commune: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        nbre_pdc: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        gratuit: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        paiement_acte: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        paiement_cb: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        paiement_autre: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        tarification: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        condition_acces: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        reservation: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        horaires: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        accessibilite_pmr: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        restriction_gabarit: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        station_deux_roues: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        raccordement: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        num_pdl: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        date_mise_en_service: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        observations: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        date_maj: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        cable_t2_attache: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        last_modified: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        datagouv_dataset_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        datagouv_resource_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        datagouv_organization_or_owner: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        consolidated_latitude: {
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        consolidated_longitude: {
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        consolidated_code_postal: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        consolidated_commune: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        consolidated_is_lon_lat_correct: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        consolidated_is_code_insee_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        consolidated_is_code_insee_modified: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        coordonneesXY: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        geom: {
          type: DataTypes.GEOMETRY("POINT", 4326),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "station",
        timestamps: true,
        underscored: true,
        modelName: "Station",
        indexes: [
          {
            unique: true,
            fields: ["id_station_itinerance"],
            where: {
              id_station_itinerance: { [Op.ne]: null },
            },
            name: "idx_station_id_itinerance_unique_not_null",
          },
          {
            unique: true,
            fields: [
              "nom_station",
              "consolidated_latitude",
              "consolidated_longitude",
            ],
            where: {
              id_station_itinerance: { [Op.eq]: null },
            },
            name: "idx_station_composite_name_coords_unique_when_no_itinerance_id",
          },
          {
            fields: ["id_station_itinerance"],
            name: "idx_station_id_itinerance_general",
          },
          {
            fields: ["nom_station"],
            name: "idx_station_nom_station",
          },
          { fields: ["id_access"], name: "idx_station_id_access" },
          { fields: ["id_provider"], name: "idx_station_id_provider" },
          { fields: ["id_book"], name: "idx_station_id_book" },
          { fields: ["id_operator"], name: "idx_station_id_operator" },
          { fields: ["id_compagny"], name: "idx_station_id_compagny" },
          {
            fields: ["consolidated_code_postal"],
            name: "idx_station_consolidated_code_postal",
          },
          {
            fields: ["consolidated_commune"],
            name: "idx_station_consolidated_commune",
          },
          { fields: ["adresse_station"], name: "idx_station_adresse_station" },
          {
            fields: ["code_insee_commune"],
            name: "idx_station_code_insee_commune",
          },
          { fields: ["date_maj"], name: "idx_station_date_maj" },
          { fields: ["last_modified"], name: "idx_station_last_modified" },
          {
            fields: ["consolidated_latitude", "consolidated_longitude"],
            name: "idx_station_lat_lon",
          },
        ],
      },
    );
  }

  static associate() {
    Station.belongsTo(Access, { foreignKey: "id_access", as: "access" });
    Station.belongsTo(Provider, { foreignKey: "id_provider", as: "provider" });
    Station.belongsTo(Book, { foreignKey: "id_book", as: "book" });
    Station.belongsTo(Operator, { foreignKey: "id_operator", as: "operator" });
    Station.belongsTo(Compagny, { foreignKey: "id_compagny", as: "compagny" });
    Station.hasMany(Terminal, {
      foreignKey: "id_station",
      as: "terminals",
      onDelete: "CASCADE",
    });
  }
}
