import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  PowerAttributes,
  PowerCreationAttributes,
} from "../types/models/models";
import { Terminal } from "./terminal.model";

export class Power
  extends Model<PowerAttributes, PowerCreationAttributes>
  implements PowerAttributes
{
  public declare id: number;
  public declare name: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Power.init(
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
        tableName: "power",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Power.hasMany(Terminal, { foreignKey: "idPower", as: "terminals" });
  }
}
