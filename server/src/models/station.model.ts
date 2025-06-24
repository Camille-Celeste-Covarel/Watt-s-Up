import type * as GeoJSON from "geojson";
import { DataTypes, Model, type Sequelize } from "sequelize";
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
  public declare id: number;
  public declare id_station_itinerance: string | null;
  public declare id_access: number | null;
  public declare id_provider: number | null;
  public declare id_book: number | null;
  public declare nom_amenageur: string | null;
  public declare siren_amenageur: string | null;
  public declare contact_amenageur: string | null;
  public declare nom_operateur: string | null;
  public declare id_operator: number | null;
  public declare contact_operateur: string | null;
  public declare telephone_operateur: string | null;
  public declare nom_enseigne: string | null;
  public declare id_compagny: number | null;
  public declare id_station_local: string | null;
  public declare nom_station: string;
  public declare implantation_station: string | null;
  public declare adresse_station: string | null;
  public declare code_insee_commune: string | null;
  public declare nbre_pdc: number | null;
  public declare gratuit: boolean | null;
  public declare paiement_acte: boolean | null;
  public declare paiement_cb: boolean | null;
  public declare paiement_autre: string | null;
  public declare tarification: string | null;
  public declare condition_acces: string | null;
  public declare reservation: boolean | null;
  public declare horaires: string | null;
  public declare accessibilite_pmr: string | null;
  public declare restriction_gabarit: string | null;
  public declare station_deux_roues: boolean | null;
  public declare raccordement: string | null;
  public declare num_pdl: string | null;
  public declare date_mise_en_service: Date | null;
  public declare observations: string | null;
  public declare date_maj: Date | null;
  public declare cable_t2_attache: boolean | null;
  public declare last_modified: Date | null;
  public declare datagouv_dataset_id: string | null;
  public declare datagouv_resource_id: string | null;
  public declare datagouv_organization_or_owner: string | null;
  public declare consolidated_latitude: number | null;
  public declare consolidated_longitude: number | null;
  public declare consolidated_code_postal: string | null;
  public declare consolidated_commune: string | null;
  public declare consolidated_is_lon_lat_correct: boolean | null;
  public declare consolidated_is_code_insee_verified: boolean | null;
  public declare consolidated_is_code_insee_modified: boolean | null;
  public declare coordonneesXY: string | null;
  public declare geom: GeoJSON.Point | null;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Station.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_station_itinerance: {
          type: DataTypes.STRING(255),
          unique: false,
          allowNull: true,
        },
        id_access: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        id_provider: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        id_book: {
          type: DataTypes.INTEGER,
          allowNull: true,
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
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "operator",
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
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "compagny",
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
          type: DataTypes.STRING(255),
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
          type: DataTypes.STRING(255),
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
      },
    );
  }

  static associate() {
    Station.belongsTo(Access, { foreignKey: "id_access", as: "access" });
    Station.belongsTo(Provider, { foreignKey: "id_provider", as: "provider" });
    Station.belongsTo(Book, { foreignKey: "id_book", as: "book" });
    Station.belongsTo(Operator, { foreignKey: "id_operator", as: "operator" });
    Station.belongsTo(Compagny, { foreignKey: "id_compagny", as: "compagny" });
    Station.hasMany(Terminal, { foreignKey: "idStation", as: "terminals" });
  }
}
