import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  BookAttributes,
  BookCreationAttributes,
} from "../types/models/models";
import { BookTerminal } from "./book_terminal.model";
import { Terminal } from "./terminal.model";
import { User } from "./user.model";

export class Book
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  public id!: string;
  public start_time!: Date | null;
  public price!: number | null;
  public actived!: boolean | null;
  public id_user!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Book.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        start_time: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        price: {
          type: DataTypes.DOUBLE,
          allowNull: true,
        },
        actived: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        id_user: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: User,
            key: "id",
          },
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
            fields: ["start_time"],
            name: "idx_book_start_time",
          },
          {
            fields: ["actived"],
            name: "idx_book_actived",
          },
        ],
      },
    );
  }

  static associate() {
    Book.belongsTo(User, { foreignKey: "id_user", as: "user" });
    Book.belongsToMany(Terminal, {
      through: BookTerminal,
      foreignKey: "id_book",
      otherKey: "id_terminal",
      as: "terminals",
    });
  }
}
