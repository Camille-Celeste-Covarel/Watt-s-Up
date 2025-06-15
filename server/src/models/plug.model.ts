// src/models/plug.model.ts

import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Vehicule } from './vehicule.model';
import { Terminal } from './terminal.model';
import { TerminalPlug } from './terminal_plug.model';

interface PlugAttributes {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PlugCreationAttributes extends Optional<PlugAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Plug extends Model<PlugAttributes, PlugCreationAttributes> implements PlugAttributes {
    public id!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Plug.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'plug',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Plug.hasMany(Vehicule, { foreignKey: 'idPlug', as: 'vehicules' });
        Plug.belongsToMany(Terminal, {
            through: TerminalPlug,
            foreignKey: 'idPlug',
            otherKey: 'idTerminal',
            as: 'terminals',
        });
    }
}