import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  PlugAttributes,
  PlugCreationAttributes,
} from "../types/models/models";
import { Terminal } from "./terminal.model";
import { TerminalPlug } from "./terminal_plug.model";
import { Vehicule } from "./vehicule.model";

export class Plug
  extends Model<PlugAttributes, PlugCreationAttributes>
  implements PlugAttributes
{
  public declare id: number;
  public declare name: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Plug.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "plug",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Plug.hasMany(Vehicule, { foreignKey: "idPlug", as: "vehicules" });
    Plug.belongsToMany(Terminal, {
      through: TerminalPlug,
      foreignKey: "idPlug",
      otherKey: "idTerminal",
      as: "terminals",
    });
  }
}
