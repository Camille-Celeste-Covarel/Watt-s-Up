import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  VehiculeAttributes,
  VehiculeCreationAttributes,
} from "../types/models/models";
import { Plug } from "./plug.model";
import { User } from "./user.model";

export class Vehicule
  extends Model<VehiculeAttributes, VehiculeCreationAttributes>
  implements VehiculeAttributes
{
  public declare id: number;
  public declare name: string;
  public declare licensePlate: string | null;
  public declare color: string | null;
  public declare idPlug: number;
  public declare idUser: number;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Vehicule.init(
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
        licensePlate: {
          type: DataTypes.STRING(128),
          allowNull: false,
          unique: true,
          field: "license_plate",
        },
        color: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
        idPlug: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "id_plug",
        },
        idUser: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "id_user",
        },
      },
      {
        sequelize,
        tableName: "vehicule",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Vehicule.belongsTo(Plug, { foreignKey: "idPlug", as: "plug" });
    Vehicule.belongsTo(User, { foreignKey: "idUser", as: "user" });
  }
}
