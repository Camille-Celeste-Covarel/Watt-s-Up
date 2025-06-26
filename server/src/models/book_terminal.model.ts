import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  BookTerminalAttributes,
  BookTerminalCreationAttributes,
} from "../types/models/models";
import { Book } from "./book.model";
import { Terminal } from "./terminal.model";

export class BookTerminal
  extends Model<BookTerminalAttributes, BookTerminalCreationAttributes>
  implements BookTerminalAttributes
{
  public id!: string;
  public id_book!: string;
  public id_terminal!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    BookTerminal.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        id_book: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: Book,
            key: "id",
          },
        },
        id_terminal: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: Terminal,
            key: "id",
          },
        },
      },
      {
        sequelize,
        tableName: "book_terminal",
        timestamps: true,
        underscored: true,
        modelName: "BookTerminal",
        indexes: [
          {
            unique: true,
            fields: ["id_book", "id_terminal"],
          },
        ],
      },
    );
  }

  static associate() {
    BookTerminal.belongsTo(Book, { foreignKey: "id_book", as: "book" });
    BookTerminal.belongsTo(Terminal, {
      foreignKey: "id_terminal",
      as: "terminal",
    });
  }
}
