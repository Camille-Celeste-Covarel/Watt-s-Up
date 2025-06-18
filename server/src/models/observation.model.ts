import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Station } from './station.model'; // Pour les associations futures
import { User } from './user.model'; // Pour les associations futures

interface ObservationAttributes {
    id: number;
    comment: string;
    idStation: number;
    idUser: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ObservationCreationAttributes extends Optional<ObservationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Observation extends Model<ObservationAttributes, ObservationCreationAttributes> implements ObservationAttributes {
    public id!: number;
    public comment!: string;
    public idStation!: number;
    public idUser!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Observation.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                comment: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                idStation: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'id_station',
                },
                idUser: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'id_user',
                },
            },
            {
                sequelize,
                tableName: 'observation',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Observation.belongsTo(Station, { foreignKey: 'idStation', as: 'station' });
        Observation.belongsTo(User, { foreignKey: 'idUser', as: 'user' });
    }
}