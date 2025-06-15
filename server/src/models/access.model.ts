import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Station } from './station.model'; // Nécessaire pour les associations futures

interface AccessAttributes {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AccessCreationAttributes extends Optional<AccessAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Access extends Model<AccessAttributes, AccessCreationAttributes> implements AccessAttributes {
    public id!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Access.init(
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
                tableName: 'access',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Access.hasMany(Station, { foreignKey: 'idAccess', as: 'stations' });
    }
}