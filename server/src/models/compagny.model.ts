
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Station } from './station.model';

interface CompagnyAttributes {
    id:
        number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CompagnyCreationAttributes extends Optional<CompagnyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Compagny extends Model<CompagnyAttributes, CompagnyCreationAttributes> implements CompagnyAttributes {
    public id!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Compagny.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'compagny',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Compagny.hasMany(Station, { foreignKey: 'idCompagny', as: 'stations' });
    }
}