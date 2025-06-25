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
  public id!: string;
  public comment!: string | null;
  public id_station!: string;
  public id_user!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Observation.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        id_station: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "station",
            key: "id",
          },
        },
        id_user: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "user",
            key: "id",
          },
        },
      },
      {
        sequelize,
        tableName: "observation",
        timestamps: true,
        underscored: true,
        modelName: "Observation",
      },
    );
  }

  static associate() {
    Observation.belongsTo(Station, { foreignKey: "id_station", as: "station" });
    Observation.belongsTo(User, { foreignKey: "id_user", as: "user" });
  }
}
