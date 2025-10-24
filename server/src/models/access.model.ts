import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  AccessAttributes,
  AccessCreationAttributes,
} from "../types/models/models";

export class Access
  extends Model<AccessAttributes, AccessCreationAttributes>
  implements AccessAttributes
{
  public id!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Access.init(
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
        tableName: "access",
        timestamps: true,
        underscored: true,
        modelName: "Access",
      },
    );
  }

  static associate(sequelize: Sequelize) {}
}
