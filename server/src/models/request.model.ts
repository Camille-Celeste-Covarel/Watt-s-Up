import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  RequestAttributes,
  RequestCreationAttributes,
} from "../types/models/models";
import { Terminal } from "./terminal.model";
import { User } from "./user.model";

export class Request
  extends Model<RequestAttributes, RequestCreationAttributes>
  implements RequestAttributes
{
  public declare id: number;
  public declare message: string | null;
  public declare dateRequest: Date | null;
  public declare status: string | null;
  public declare response: string | null;
  public declare idUser: number;
  public declare idTerminal: number;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Request.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        dateRequest: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "date_request",
        },
        status: {
          type: DataTypes.ENUM("pending", "accepted", "rejected"),
          allowNull: false,
          defaultValue: "pending",
        },
        response: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        idUser: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "id_user",
        },
        idTerminal: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "id_terminal",
        },
      },
      {
        sequelize,
        tableName: "request",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Request.belongsTo(User, { foreignKey: "idUser", as: "user" });
    Request.belongsTo(Terminal, { foreignKey: "idTerminal", as: "terminal" });
  }
}
