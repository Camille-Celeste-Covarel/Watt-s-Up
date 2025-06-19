import type * as GeoJSON from "geojson";
import { DataTypes, Model, type Sequelize } from "sequelize";
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
  public declare id: number;
  public declare idStation: number;
  public declare idBook: number | null;
  public declare idPower: number | null;

  public declare id_pdc_itinerance: string | null;
  public declare id_pdc_local: string | null;
  public declare latitude: number | null;
  public declare longitude: number | null;
  public declare geom: GeoJSON.Point | null;

  public declare typeDePrise: string;
  public declare puissanceNominale: number;
  public declare priseType2: boolean;
  public declare priseTypeEf: boolean;
  public declare priseChademo: boolean;
  public declare priseComboCcs: boolean;
  public declare priseAutre: string | null;

  public declare status: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Terminal.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        idStation: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "station",
            key: "id",
          },
        },
        idBook: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "book",
            key: "id",
          },
        },
        idPower: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "power",
            key: "id",
          },
        },
        id_pdc_itinerance: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true,
        },
        id_pdc_local: {
          type: DataTypes.STRING(255),
          allowNull: true,
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
        typeDePrise: {
          type: DataTypes.STRING(255),
          allowNull: false,
          defaultValue: "UNKNOWN",
        },
        puissanceNominale: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        priseType2: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        priseTypeEf: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        priseChademo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        priseComboCcs: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        priseAutre: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: "unknown",
        },
      },
      {
        sequelize,
        tableName: "terminal",
        timestamps: true,
        underscored: true,
        modelName: "Terminal",
      },
    );
  }

  static associate() {
    Terminal.belongsTo(Station, { foreignKey: "idStation", as: "station" });
    Terminal.belongsTo(Book, { foreignKey: "idBook", as: "book" });
    Terminal.belongsTo(Power, { foreignKey: "idPower", as: "power" });
    Terminal.belongsToMany(Book, {
      through: BookTerminal,
      foreignKey: "idTerminal",
      otherKey: "idBook",
      as: "relatedBooks",
    });
    Terminal.belongsToMany(Plug, {
      through: TerminalPlug,
      foreignKey: "idTerminal",
      otherKey: "idPlug",
      as: "plugs",
    });
  }
}
