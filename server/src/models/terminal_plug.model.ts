import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  TerminalPlugAttributes,
  TerminalPlugCreationAttributes,
} from "../types/models/models";
import { Plug } from "./plug.model";
import { Terminal } from "./terminal.model";

export class TerminalPlug
  extends Model<TerminalPlugAttributes, TerminalPlugCreationAttributes>
  implements TerminalPlugAttributes
{
  public id!: string;
  public idPlug!: string;
  public idTerminal!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    TerminalPlug.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        idPlug: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: Plug,
            key: "id",
          },
          field: "id_plug",
        },
        idTerminal: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: Terminal,
            key: "id",
          },
          field: "id_terminal",
          onDelete: 'CASCADE',
        },
      },
      {
        sequelize,
        tableName: "terminal_plug",
        timestamps: true,
        underscored: true,
        modelName: "TerminalPlug",
        indexes: [
          {
            unique: true,
            fields: ["id_plug", "id_terminal"],
            name: "idx_terminal_plug_unique_pair",
          },
        ],
      },
    );
  }

  static associate(sequelize: Sequelize) {
    TerminalPlug.belongsTo(Terminal, {
      foreignKey: "idTerminal",
      as: "terminal",
      targetKey: "id",
    });
    TerminalPlug.belongsTo(Plug, {
      foreignKey: "idPlug",
      as: "plug",
      targetKey: "id",
    });
  }
}
