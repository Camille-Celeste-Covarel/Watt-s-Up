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
  public declare idPlug: number;
  public declare idTerminal: number;

  static initialize(sequelize: Sequelize) {
    TerminalPlug.init(
      {
        idPlug: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: "id_plug",
          references: {
            model: Plug,
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        idTerminal: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: "id_terminal",
          references: {
            model: Terminal,
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      {
        sequelize,
        tableName: "terminal_plug",
        timestamps: false,
        underscored: true,
        modelName: "TerminalPlug",
      },
    );
  }

  static associate() {}
}
