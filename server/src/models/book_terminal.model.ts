import { Model, DataTypes, Sequelize } from 'sequelize';

export class BookTerminal extends Model {
    public id!: number;
    public idBook!:
        number;
    public idTerminal!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                idBook: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                idTerminal: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'book_terminal',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
    }
}