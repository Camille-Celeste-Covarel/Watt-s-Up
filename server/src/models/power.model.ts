import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  PowerAttributes,
  PowerCreationAttributes,
} from "../types/models/models";

export class Power
  extends Model<PowerAttributes, PowerCreationAttributes>
  implements PowerAttributes
{
  public id!: string;
  public name!: number;
  public readonly charging_type?:
    | "Lente"
    | "Accélérée"
    | "Rapide"
    | "Très Rapide"
    | "Inconnue";

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Power.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          unique: true,
        },
        charging_type: {
          type: DataTypes.VIRTUAL,
          get() {
            const powerValue = this.getDataValue("name");
            if (powerValue <= 7.4) {
              return "Lente";
            }
            if (powerValue <= 22.08) {
              return "Accélérée";
            }
            if (powerValue <= 150) {
              return "Rapide";
            }
            if (powerValue > 150) {
              return "Très Rapide";
            }
            return "Inconnue";
          },
        },
      },
      {
        sequelize,
        tableName: "power",
        timestamps: true,
        underscored: true,
        modelName: "Power",
      },
    );
  }

  static associate() {}
}
