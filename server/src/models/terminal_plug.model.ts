import { Model, DataTypes, Sequelize } from 'sequelize';
import { Plug } from './plug.model';
import { Terminal } from './terminal.model';

interface TerminalPlugAttributes {
    idPlug:
        number;
    idTerminal: number;
}

export class TerminalPlug extends Model<TerminalPlugAttributes> implements TerminalPlugAttributes {
    public idPlug!: number;
    public idTerminal!: number;

    static initialize(sequelize: Sequelize) {
        TerminalPlug.init(
            {
                idPlug: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    allowNull: false,
                    field: 'id_plug',
                    references: {
                        model: Plug,
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                idTerminal: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    allowNull: false,
                    field: 'id_terminal',
                    references: {
                        model: Terminal,
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
            },
            {
                sequelize,
                tableName: 'terminal-plug',
                timestamps: false,
                underscored: true,
                modelName: 'TerminalPlug',
            }
        );
    }

    static associate() {
    }
}