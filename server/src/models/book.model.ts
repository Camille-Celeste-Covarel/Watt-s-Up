import { DataTypes, Model, type Optional, type Sequelize } from "sequelize";
import { Terminal } from "./terminal.model"; // Pour les associations futures
import { User } from "./user.model"; // Pour les associations futures

interface BookAttributes {
  id: number;
  startTime: Date;
  price: number;
  actived: boolean;
  idUser: number;
  idTerminal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookCreationAttributes
  extends Optional<BookAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Book
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  public id!: number;
  public startTime!: Date;
  public price!: number;
  public actived!: boolean;
  public idUser!: number;
  public idTerminal!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
