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
  public reset_token?: string | null;
  public reset_token_expiry?: Date | null;

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
        reset_token: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        reset_token_expiry: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "user",
        timestamps: true,
        underscored: true,
        modelName: "User",
        indexes: [
          {
            unique: true,
            fields: ["email"],
            name: "idx_user_email_unique",
          },
          {
            fields: ["last_name", "first_name"],
            name: "idx_user_last_first_name",
          },
          {
            fields: ["city"],
            name: "idx_user_city",
          },
          {
            fields: ["postcode"],
            name: "idx_user_postcode",
          },
          {
            fields: ["country"],
            name: "idx_user_country",
          },
          {
            fields: ["is_admin"],
            name: "idx_user_is_admin",
          },
        ],
      },
    );
  }

  static associate(sequelize: Sequelize) {}
}
