import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  OperatorAttributes,
  OperatorCreationAttributes,
} from "../types/models/models";

export class Operator
  extends Model<OperatorAttributes, OperatorCreationAttributes>
  implements OperatorAttributes
{
  public id!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Operator.init(
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
        tableName: "operator",
        timestamps: true,
        underscored: true,
        modelName: "Operator",
      },
    );
  }

  static associate() {}
}
