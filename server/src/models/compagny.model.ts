import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  CompagnyAttributes,
  CompagnyCreationAttributes,
} from "../types/models/models";
import { Station } from "./station.model";

export class Compagny
  extends Model<CompagnyAttributes, CompagnyCreationAttributes>
  implements CompagnyAttributes
{
  public declare id: number;
  public declare name: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Compagny.init(
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
        tableName: "compagny",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Compagny.hasMany(Station, { foreignKey: "idCompagny", as: "stations" });
  }
}
