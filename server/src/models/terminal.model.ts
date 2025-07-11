import type * as GeoJSON from "geojson";
import {
  type BelongsToManySetAssociationsMixin,
  DataTypes,
  Model,
  Op,
  type Sequelize,
} from "sequelize";
import type {
  TerminalAttributes,
  TerminalCreationAttributes,
} from "../types/models/models";
import { Book } from "./book.model";
import { BookTerminal } from "./book_terminal.model";
import { Plug } from "./plug.model";
import { Power } from "./power.model";
import { Station } from "./station.model";
import { TerminalPlug } from "./terminal_plug.model";

export class Terminal
  extends Model<TerminalAttributes, TerminalCreationAttributes>
  implements TerminalAttributes
{
  public id!: string;
  public id_station!: string;
  public id_power!: string | null;
  public id_pdc_itinerance!: string | null;
  public id_pdc_local!: string | null;
  public latitude!: number | null;
  public longitude!: number | null;
  public geom!: GeoJSON.Point | null;
  public puissance_nominale!: number;
  public status!: string | null;
  public num_pdc!: string | null;
  public is_booked!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public setPlugs!: BelongsToManySetAssociationsMixin<Plug, string>;

  static initialize(sequelize: Sequelize) {
    Terminal.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        id_station: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: Station,
            key: "id",
          },
        },
        id_power: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: Power,
            key: "id",
          },
        },
        id_pdc_itinerance: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        id_pdc_local: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        is_booked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        latitude: {
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        longitude: {
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        geom: {
          type: DataTypes.GEOMETRY("POINT", 4326),
          allowNull: true,
        },
        puissance_nominale: {
          type: DataTypes.DOUBLE,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        num_pdc: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "terminal",
        timestamps: true,
        underscored: true,
        modelName: "Terminal",
        indexes: [
          {
            unique: true,
            fields: ["id_pdc_itinerance"],
            where: {
              id_pdc_itinerance: { [Op.ne]: null },
            },
            name: "idx_terminal_id_pdc_itinerance_unique_not_null",
          },
          {
            fields: ["id_pdc_itinerance"],
            name: "idx_terminal_id_pdc_itinerance_general",
          },
          {
            fields: ["id_station"],
            name: "idx_terminal_id_station",
          },
          {
            fields: ["id_power"],
            name: "idx_terminal_id_power",
          },
          {
            fields: ["puissance_nominale"],
            name: "idx_terminal_puissance_nominale",
          },
          {
            fields: [sequelize.literal("geom")],
            using: "GIST",
            name: "idx_terminal_geom_gist",
          },
          {
            fields: ["status"],
            name: "idx_terminal_status",
          },
        ],
      },
    );
  }

  static associate() {
    Terminal.belongsTo(Station, { foreignKey: "id_station", as: "station" });
    Terminal.belongsTo(Power, { foreignKey: "id_power", as: "power" });
    Terminal.belongsToMany(Book, {
      through: BookTerminal,
      foreignKey: "id_terminal",
      otherKey: "id_book",
      as: "books",
    });

    Terminal.belongsToMany(Plug, {
      through: TerminalPlug,
      foreignKey: "id_terminal",
      otherKey: "id_plug",
      as: "plugs",
    });
  }
}
