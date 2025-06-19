import { DataTypes, Model, type Optional, type Sequelize } from "sequelize";
import type {
  AccessAttributes,
  AccessCreationAttributes,
} from "../types/models/models";
import { Station } from "./station.model";

export class Access
  extends Model<AccessAttributes, AccessCreationAttributes>
  implements AccessAttributes
{
  public declare id: number;
  public declare name: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Access.init(
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
        tableName: "access",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Access.hasMany(Station, { foreignKey: "idAccess", as: "stations" });
  }
}
