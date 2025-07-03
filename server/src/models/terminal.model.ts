import type * as GeoJSON from "geojson";
import { DataTypes, Model, Op, type Sequelize } from "sequelize";
import type {
  TerminalAttributes,
  TerminalCreationAttributes,
} from "../types/models/models";
import { Book } from "./book.model";
import { BookTerminal } from "./book_terminal.model";
import { Power } from "./power.model";
import { Station } from "./station.model";

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
  public type_de_prise!: string;
  public puissance_nominale!: number;
  public prise_type_2!: boolean;
  public prise_type_ef!: boolean;
  public prise_chademo!: boolean;
  public prise_combo_ccs!: boolean;
  public prise_autre!: string | null;
  public status!: string | null;
  public num_pdc!: string | null;
  public is_booked!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
        type_de_prise: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        puissance_nominale: {
          type: DataTypes.DOUBLE,
          allowNull: false,
        },
        prise_type_2: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        prise_type_ef: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        prise_chademo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        prise_combo_ccs: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        prise_autre: {
          type: DataTypes.STRING(255),
          allowNull: true,
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
            fields: ["type_de_prise"],
            name: "idx_terminal_type_de_prise",
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
  }
}
