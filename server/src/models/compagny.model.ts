import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  CompagnyAttributes,
  CompagnyCreationAttributes,
} from "../types/models/models";

export class Compagny
  extends Model<CompagnyAttributes, CompagnyCreationAttributes>
  implements CompagnyAttributes
{
  public id!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Compagny.init(
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
        tableName: "compagny",
        timestamps: true,
        underscored: true,
        modelName: "Compagny",
        indexes: [
          {
            unique: true,
            fields: ["name"],
            name: "idx_compagny_name_unique",
          },
        ],
      },
    );
  }

  static associate() {}
}
