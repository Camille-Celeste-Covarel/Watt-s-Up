// src/models/power.model.ts

import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Terminal } from './terminal.model';

interface PowerAttributes {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PowerCreationAttributes extends Optional<PowerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Power extends Model<PowerAttributes, PowerCreationAttributes> implements PowerAttributes {
    public id!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Power.init(
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
                tableName: 'power',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Power.hasMany(Terminal, { foreignKey: 'idPower', as: 'terminals' });
    }
}