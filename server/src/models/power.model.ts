import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  PowerAttributes,
  PowerCreationAttributes,
} from "../types/models/models";

export class Power
  extends Model<PowerAttributes, PowerCreationAttributes>
  implements PowerAttributes
{
  public id!: string;
  public name!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Power.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        tableName: "power",
        timestamps: true,
        underscored: true,
        modelName: "Power",
      },
    );
  }

  static associate() {}
}
