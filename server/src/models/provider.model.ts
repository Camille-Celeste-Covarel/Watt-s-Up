import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  ProviderAttributes,
  ProviderCreationAttributes,
} from "../types/models/models";
import { Station } from "./station.model";

export class Provider
  extends Model<ProviderAttributes, ProviderCreationAttributes>
  implements ProviderAttributes
{
  public declare id: number;
  public declare name: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Provider.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "provider",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Provider.hasMany(Station, { foreignKey: "idProvider", as: "stations" });
  }
}
