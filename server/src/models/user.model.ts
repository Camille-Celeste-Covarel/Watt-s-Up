import { DataTypes, Model, type Optional, type Sequelize } from "sequelize";

// 1. Interface des attributs du modèle (ce que le modèle contient après avoir été créé/récupéré)
interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender?: "Femme" | "Homme" | "Autre";
  birthdate: Date;
  address: string;
  addressBis?: string;
  city: string;
  postcode: string;
  country: string;
  password: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "id"
    | "avatarUrl"
    | "isAdmin"
    | "gender"
    | "addressBis"
    | "createdAt"
    | "updatedAt"
  > {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public gender?: "Femme" | "Homme" | "Autre";
  public birthdate!: Date;
  public address!: string;
  public addressBis?: string;
  public city!: string;
  public postcode!: string;
  public country!: string;
  public password!: string;
  public avatarUrl?: string;
  public isAdmin!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
