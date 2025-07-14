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
  public expiresAt!: Date;
  public sessionEndsAt!: Date | null;
  public price!: number | null;

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
          field: "id_user",
          references: { model: User, key: "id" },
        },
        id_terminal: {
          type: DataTypes.UUID,
          allowNull: false,
          field: "id_terminal",
          references: { model: Terminal, key: "id" },
        },
        status: {
          type: DataTypes.ENUM(...Object.values(ReservationStatus)),
          allowNull: false,
          defaultValue: ReservationStatus.ACTIVE,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "expires_at",
        },
        sessionEndsAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "session_ends_at",
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
          {
            fields: ["id_user"],
            name: "idx_book_id_user",
          },
          {
            fields: ["status"],
            name: "idx_book_status",
          },
          {
            fields: ["expires_at"],
            name: "idx_book_expires_at",
          },
        ],
      },
    );
  }

  static associate() {
    Book.belongsTo(User, { foreignKey: "userId", as: "user" });
    Book.belongsTo(Terminal, { foreignKey: "terminalId", as: "terminal" });
  }
}
