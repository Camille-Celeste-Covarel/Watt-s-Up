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
  public id!: string;
  public name!: string;
  public license_plate!: string | null;
  public color!: string | null;
  public id_plug!: string;
  public id_user!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Vehicule.init(
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
        },
        license_plate: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        color: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        id_plug: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "plug",
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
        tableName: "vehicule",
        timestamps: true,
        underscored: true,
        modelName: "Vehicule",
      },
    );
  }

  static associate() {
    Vehicule.belongsTo(Plug, { foreignKey: "id_plug", as: "plug" });
    Vehicule.belongsTo(User, { foreignKey: "id_user", as: "user" });
  }
}
