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
  public id!: string;
  public message!: string | null;
  public date_request!: Date | null;
  public status!: string | null;
  public response!: string | null;
  public id_user!: string;
  public id_terminal!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Request.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        date_request: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        response: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        id_user: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "user",
            key: "id",
          },
        },
        id_terminal: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "terminal",
            key: "id",
          },
        },
      },
      {
        sequelize,
        tableName: "request",
        timestamps: true,
        underscored: true,
        modelName: "Request",
      },
    );
  }

  static associate() {
    Request.belongsTo(User, { foreignKey: "id_user", as: "user" });
    Request.belongsTo(Terminal, { foreignKey: "id_terminal", as: "terminal" });
  }
}
