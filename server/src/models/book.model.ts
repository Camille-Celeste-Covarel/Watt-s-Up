import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  BookAttributes,
  BookCreationAttributes,
} from "../types/models/models";
import { Terminal } from "./terminal.model";
import { User } from "./user.model";

export enum ReservationStatus {
  ACTIVE = "ACTIVE",
  IN_USE = "IN_USE",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export class Book
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  public id!: string;
  public id_user!: string;
  public id_terminal!: string;
  public status!: ReservationStatus;
  public expires_at!: Date;
  public charge_started_at!: Date | null;
  public session_ends_at!: Date | null;
  public price!: number | null;

  // Déclaration de l'association pour que TypeScript la reconnaisse
  public readonly terminal?: Terminal;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Book.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        id_user: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: User, key: "id" },
        },
        id_terminal: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: Terminal, key: "id" },
        },
        status: {
          type: DataTypes.ENUM(...Object.values(ReservationStatus)),
          allowNull: false,
          defaultValue: ReservationStatus.ACTIVE,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        charge_started_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        session_ends_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        price: {
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "book",
        timestamps: true,
        underscored: true,
        modelName: "Book",
        indexes: [
          { fields: ["id_user"] },
          { fields: ["status"] },
          { fields: ["expires_at"] },
        ],
      },
    );
  }

  static associate(sequelize: Sequelize) {
    Book.belongsTo(sequelize.models.User, {
      foreignKey: "id_user",
      as: "user",
    });
    Book.belongsTo(sequelize.models.Terminal, {
      foreignKey: "id_terminal",
      as: "terminal",
      onDelete: 'CASCADE',
    });
  }
}
