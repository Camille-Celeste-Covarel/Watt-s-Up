import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  UserAttributes,
  UserCreationAttributes,
} from "../types/models/models";

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public declare id: number;
  public declare firstName: string;
  public declare lastName: string;
  public declare email: string;
  public declare gender?: "Femme" | "Homme" | "Autre";
  public declare birthdate: Date;
  public declare address: string;
  public declare addressBis?: string;
  public declare city: string;
  public declare postcode: string;
  public declare country: string;
  public declare password: string;
  public declare avatarUrl?: string;
  public declare isAdmin: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
  static associate() {}

  static initialize(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: "first_name",
        },
        lastName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: "last_name",
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
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: "adress",
        },
        addressBis: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: "adress_bis",
        },
        city: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        postcode: {
          type: DataTypes.CHAR(5),
          allowNull: false,
        },
        country: {
          type: DataTypes.CHAR(2),
          allowNull: false,
        },
        password: {
          type: DataTypes.CHAR(64),
          allowNull: false,
          field: "passwd_hash",
        },
        avatarUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: "avatar_url",
        },
        isAdmin: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: "is_admin",
        },
      },
      {
        sequelize,
        tableName: "user",
        timestamps: true,
        underscored: true,
      },
    );
  }
}
