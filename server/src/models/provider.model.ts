import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  ProviderAttributes,
  ProviderCreationAttributes,
} from "../types/models/models";

export class Provider
  extends Model<ProviderAttributes, ProviderCreationAttributes>
  implements ProviderAttributes
{
  public id!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Provider.init(
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
        tableName: "provider",
        timestamps: true,
        underscored: true,
        modelName: "Provider",
        indexes: [
          {
            unique: true,
            fields: ["name"],
            name: "idx_provider_name_unique",
          },
        ],
      },
    );
  }

  static associate() {}
}
