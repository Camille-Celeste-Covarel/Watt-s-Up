import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  PlugAttributes,
  PlugCreationAttributes,
} from "../types/models/models";
import { Terminal } from "./terminal.model";
import { TerminalPlug } from "./terminal_plug.model";

export class Plug
  extends Model<PlugAttributes, PlugCreationAttributes>
  implements PlugAttributes
{
  public id!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Plug.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        tableName: "plug",
        timestamps: true,
        underscored: true,
        modelName: "Plug",
        indexes: [
          {
            unique: true,
            fields: ["name"],
            name: "idx_plug_name_unique",
          },
        ],
      },
    );
  }

  static associate(sequelize: Sequelize) {
    Plug.belongsToMany(Terminal, {
      through: TerminalPlug,
      foreignKey: "id_plug",
      otherKey: "id_terminal",
      as: "terminals",
    });
  }
}
