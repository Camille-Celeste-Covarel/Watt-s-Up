import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  OperatorAttributes,
  OperatorCreationAttributes,
} from "../types/models/models";
import { Station } from "./station.model";

export class Operator
  extends Model<OperatorAttributes, OperatorCreationAttributes>
  implements OperatorAttributes
{
  public declare id: number;
  public declare name: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Operator.init(
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
        tableName: "operator",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Operator.hasMany(Station, { foreignKey: "idOperator", as: "stations" });
  }
}
