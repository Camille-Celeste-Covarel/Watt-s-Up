import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Station } from './station.model';

interface ProviderAttributes {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ProviderCreationAttributes extends Optional<ProviderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Provider extends Model<ProviderAttributes, ProviderCreationAttributes> implements ProviderAttributes {
    public id!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Provider.init(
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
                tableName: 'provider',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Provider.hasMany(Station, { foreignKey: 'idProvider', as: 'stations' });
    }
}