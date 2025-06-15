import { Model, DataTypes, Sequelize } from 'sequelize';
import { Station } from './station.model';
import { Book } from './book.model';
import { Power } from './power.model';
import { Plug } from './plug.model';
import { BookTerminal } from './book_terminal.model';
import { TerminalPlug } from './terminal_plug.model';

export class Terminal extends Model {
    public id!: number;
    public idStation!: number;
    public idBook?: number;
    public idPower?: number;
    public typeDePrise!: string;
    public puissanceNominale!: number;
    public priseType2!: boolean;
    public priseTypeEf!: boolean;
    public priseChademo!: boolean;
    public priseComboCcs!: boolean;
    public priseAutre?: string;
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
                idStation: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                idBook: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                idPower: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                typeDePrise: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                puissanceNominale: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                priseType2: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                priseTypeEf: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                priseChademo: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                priseComboCcs: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                priseAutre: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: 'terminal',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Terminal.belongsTo(Station, { foreignKey: 'idStation', as: 'station' });
        Terminal.belongsTo(Book, { foreignKey: 'idBook', as: 'book' });
        Terminal.belongsTo(Power, { foreignKey: 'idPower', as: 'power' });
        Terminal.belongsToMany(Book, {
            through: BookTerminal,
            foreignKey: 'idTerminal',
            otherKey: 'idBook',
            as: 'relatedBooks',
        });
        Terminal.belongsToMany(Plug, {
            through: TerminalPlug,
            foreignKey: 'idTerminal',
            otherKey: 'idPlug',
            as: 'plugs',
        });
    }
}