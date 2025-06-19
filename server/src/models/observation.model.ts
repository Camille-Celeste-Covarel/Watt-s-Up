import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  ObservationAttributes,
  ObservationCreationAttributes,
} from "../types/models/models";
import { Station } from "./station.model";
import { User } from "./user.model";

export class Observation
  extends Model<ObservationAttributes, ObservationCreationAttributes>
  implements ObservationAttributes
{
  public declare id: number;
  public declare comment: string | null;
  public declare idStation: number;
  public declare idUser: number;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Observation.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        idStation: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "id_station",
        },
        idUser: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "id_user",
        },
      },
      {
        sequelize,
        tableName: "observation",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Observation.belongsTo(Station, { foreignKey: "idStation", as: "station" });
    Observation.belongsTo(User, { foreignKey: "idUser", as: "user" });
  }
}
