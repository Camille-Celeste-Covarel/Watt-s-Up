import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  BookAttributes,
  BookCreationAttributes,
} from "../types/models/models";
import { Terminal } from "./terminal.model";
import { User } from "./user.model";

export class Book
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  public declare id: number;
  public declare startTime: Date | null;
  public declare price: number | null;
  public declare actived: boolean | null;
  public declare idUser: number;
  public declare idTerminal: number;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Book.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "start_time",
        },
        price: {
          type: DataTypes.DECIMAL(10, 0),
          allowNull: false,
        },
        actived: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        idUser: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "id_user",
        },
        idTerminal: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "id_terminal",
        },
      },
      {
        sequelize,
        tableName: "book",
        timestamps: true,
        underscored: true,
      },
    );
  }

  static associate() {
    Book.belongsTo(User, { foreignKey: "idUser", as: "user" });
    Book.belongsTo(Terminal, { foreignKey: "idTerminal", as: "terminal" });
  }
}
