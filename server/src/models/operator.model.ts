import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Station } from './station.model';

interface OperatorAttributes {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface OperatorCreationAttributes extends Optional<OperatorAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Operator extends Model<OperatorAttributes, OperatorCreationAttributes> implements OperatorAttributes {
    public id!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Operator.init(
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
                tableName: 'operator',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Operator.hasMany(Station, { foreignKey: 'idOperator', as: 'stations' });
    }
}