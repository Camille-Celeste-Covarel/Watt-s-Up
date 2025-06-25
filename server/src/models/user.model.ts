import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  UserAttributes,
  UserCreationAttributes,
} from "../types/models/models";

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public gender?: "Femme" | "Homme" | "Autre";
  public birthdate!: Date;
  public address!: string;
  public address_bis?: string;
  public city!: string;
  public postcode!: string;
  public country!: string;
  public password!: string;
  public avatar_url?: string;
  public is_admin!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        first_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        gender: {
          type: DataTypes.ENUM("Femme", "Homme", "Autre"),
          allowNull: true,
        },
        birthdate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        address_bis: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        postcode: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        country: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        avatar_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        is_admin: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: "user",
        timestamps: true,
        underscored: true,
        modelName: "User",
      },
    );
  }

  static associate() {}
}
